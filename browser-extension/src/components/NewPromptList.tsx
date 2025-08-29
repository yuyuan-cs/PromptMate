import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { PromptCard } from './PromptCard';
import { Prompt } from '../shared/types';
import { useTranslation } from '../i18n';

interface NewPromptListProps {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  onPromptSelect: (prompt: Prompt) => void;
  onCopyWithVariables: (prompt: Prompt) => void;
  onInjectWithVariables: (prompt: Prompt) => void;
  onToggleFavorite: (promptId: string) => void;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (prompt: Prompt) => void;
  // height?: number;
}

export const NewPromptList: React.FC<NewPromptListProps> = ({
  prompts,
  selectedPrompt,
  onPromptSelect,
  onCopyWithVariables,
  onInjectWithVariables,
  onToggleFavorite,
  onEditPrompt,
  onDeletePrompt,
  // height = 400,
}) => {
  const { t } = useTranslation();
  // 展开状态管理
  const [expandedCardId, setExpandedCardId] = React.useState<string | null>(null);
  
  // 虚拟化容器引用
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  // ResizeObserver 用于监听元素尺寸变化
  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);
  
  // 存储每个元素的引用，用于测量
  const itemRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

  // 初始化虚拟化器
  const virtualizer = useVirtualizer({
    count: prompts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // 预估高度
    overscan: 5, // 预渲染额外项目数量
    measureElement: (element) => {
      // 精确测量元素高度
      return element?.getBoundingClientRect().height ?? 150;
    },
  });

  // 处理卡片展开/折叠
  const handleToggleExpand = React.useCallback((promptId: string) => {
    setExpandedCardId(prevId => {
      const newExpandedId = prevId === promptId ? null : promptId;
      
      // 找到对应的索引并触发重新测量
      const promptIndex = prompts.findIndex(p => p.id === promptId);
      if (promptIndex !== -1) {
        // 延迟测量以确保DOM更新完成
        setTimeout(() => {
          const element = itemRefs.current.get(promptIndex);
          if (element) {
            virtualizer.measureElement(element);
          }
        }, 50);
      }
      
      return newExpandedId;
    });
  }, [prompts, virtualizer]);

  // 设置ResizeObserver来监听元素尺寸变化
  React.useEffect(() => {
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLDivElement;
          const index = parseInt(element.dataset.index || '0', 10);
          
          // 通知虚拟化器重新测量
          if (!isNaN(index)) {
            virtualizer.measureElement(element);
          }
        }
      });
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [virtualizer]);

  // 管理元素引用和ResizeObserver
  const setItemRef = React.useCallback((index: number, element: HTMLDivElement | null) => {
    const currentElement = itemRefs.current.get(index);
    
    // 移除旧的观察
    if (currentElement && resizeObserverRef.current) {
      resizeObserverRef.current.unobserve(currentElement);
    }
    
    if (element) {
      // 存储新引用
      itemRefs.current.set(index, element);
      element.dataset.index = index.toString();
      
      // 添加新的观察
      if (resizeObserverRef.current) {
        resizeObserverRef.current.observe(element);
      }
      
      // 立即测量新元素
      virtualizer.measureElement(element);
    } else {
      // 清理引用
      itemRefs.current.delete(index);
    }
  }, [virtualizer]);

  // 获取虚拟项目
  const virtualItems = virtualizer.getVirtualItems();

  // 空状态处理
  if (prompts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground">{t('prompts_noPrompts')}</div>
          <div className="text-xs text-muted-foreground">{t('prompts_createNew')}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full w-full overflow-y-auto"
      // style={{ height }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const prompt = prompts[virtualItem.index];
          if (!prompt) return null;

          const isExpanded = expandedCardId === prompt.id;
          const isSelected = selectedPrompt?.id === prompt.id;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={(element) => {
                // 设置虚拟化器的测量引用
                virtualizer.measureElement(element);
                // 设置我们自己的引用管理
                setItemRef(virtualItem.index, element);
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <PromptCard
                prompt={prompt}
                isExpanded={isExpanded}
                isSelected={isSelected}
                onToggleExpand={handleToggleExpand}
                onSelect={onPromptSelect}
                onCopyWithVariables={onCopyWithVariables}
                onInjectWithVariables={onInjectWithVariables}
                onToggleFavorite={onToggleFavorite}
                onEdit={onEditPrompt}
                onDelete={onDeletePrompt}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
