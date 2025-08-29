import React from 'react';
import { VariableSizeList as List } from 'react-window';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { Prompt } from '../shared/types';
import { hasVariables, extractVariables } from '../shared/variableUtils';
import { useTranslation } from '../i18n';
import { Icons } from './ui/icons';

interface VirtualizedPromptListProps {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  expandedPromptId: string | null;
  onPromptSelect: (prompt: Prompt) => void;
  onToggleExpand: (promptId: string) => void;
  onCopyWithVariables: (prompt: Prompt) => void;
  onInjectWithVariables: (prompt: Prompt) => void;
  onToggleFavorite: (promptId: string) => void;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (prompt: Prompt) => void;
  height?: number;
}

interface PromptItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    prompts: Prompt[];
    selectedPrompt: Prompt | null;
    expandedPromptId: string | null;
    onPromptSelect: (prompt: Prompt) => void;
    onToggleExpand: (promptId: string) => void;
    onCopyWithVariables: (prompt: Prompt) => void;
    onInjectWithVariables: (prompt: Prompt) => void;
    onToggleFavorite: (promptId: string) => void;
    onEditPrompt: (prompt: Prompt) => void;
    onDeletePrompt: (prompt: Prompt) => void;
  };
}

const PromptItem: React.FC<PromptItemProps> = ({ index, style, data }) => {
  const {
    prompts,
    selectedPrompt,
    expandedPromptId,
    onPromptSelect,
    onToggleExpand,
    onCopyWithVariables,
    onInjectWithVariables,
    onToggleFavorite,
    onEditPrompt,
    onDeletePrompt,
  } = data;

  const { t } = useTranslation();
  const [expandedPrompts, setExpandedPrompts] = React.useState<Set<string>>(new Set());
  const [hoveredPrompt, setHoveredPrompt] = React.useState<string | null>(null);
  const prompt = prompts[index];
  const [isHovered, setIsHovered] = React.useState(false);
  const isExpanded = expandedPromptId === prompt.id;
  
  if (!prompt) return null;

  // 点击主区域展开/收起预览
  const handleMainClick = () => {
    onToggleExpand(prompt.id);
    onPromptSelect(prompt);
  };

  // 快速操作处理
  const handleQuickAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div style={{...style, position: 'relative'}} className="prompt-card-wrapper px-3 pb-0.5 virtual-list-item">
      <div
        className={cn(
          "group relative bg-background transition-all duration-200 ease-out cursor-pointer",
          // 默认状态 - 极简边框
          "border border-border/30 rounded-lg",
          // 悬浮状态 - 微妙提升
          "hover:border-border/60 hover:shadow-sm hover:bg-background/80",
          // 选中状态 - 清晰标识
          selectedPrompt?.id === prompt.id && "ring-1 ring-primary/40 border-primary/50 bg-primary/5",
          // 展开状态 - 明确反馈
          isExpanded && "border-primary/40 bg-primary/5"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleMainClick}
      >
        {/* 第一层：核心信息区 (自适应高度) */}
        <div className="p-3 cursor-pointer min-h-0 flex flex-col">
          {/* 标题行 - 固定高度 */}
          <div className="flex items-start justify-between mb-1.5 min-h-[20px]">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-3.5 w-3.5 p-0 shrink-0 opacity-50 hover:opacity-90 border-0"
                onClick={(e) => handleQuickAction(e, () => onToggleFavorite(prompt.id))}
              >
                <Icons.star 
                  className={cn(
                    "w-2.5 h-2.5 transition-all duration-200",
                    prompt.isFavorite ? "fill-amber-400 text-amber-400 scale-110" : "text-muted-foreground/50"
                  )}
                />
              </Button>
              <h3 className="font-medium text-sm leading-tight flex-1 min-w-0">
                {prompt.title}
              </h3>
            </div>
            
            {/* 使用统计 */}
            {prompt.usageCount !== undefined && prompt.usageCount > 0 && (
              <span className="text-xs text-muted-foreground/80 shrink-0 ml-2 leading-tight">
                {prompt.usageCount}
              </span>
            )}
          </div>

          {/* 描述行 - 可选，自适应高度 */}
          {prompt.description && (
            <p className="text-xs text-muted-foreground/80 leading-relaxed mb-1.5 line-clamp-1">
              {prompt.description}
            </p>
          )}

          {/* 标签行 - 极简设计 */}
          {prompt.tags.length > 0 && (
            <div className="flex items-center gap-1 mb-2 min-h-[16px]">
              <span className="text-[10px] px-1.5 py-0.5 bg-muted/60 text-muted-foreground rounded-full leading-none">
                {prompt.tags[0]}
              </span>
              {prompt.tags.length > 1 && (
                <span className="text-[10px] px-1 py-0.5 text-muted-foreground/60 leading-none">
                  +{prompt.tags.length - 1}
                </span>
              )}
            </div>
          )}

          {/* 主要操作按钮 - 图标紧凑设计 */}
          <div className="flex gap-1.5 mt-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-muted/40 hover:bg-muted/60 border-0 text-foreground/80 hover:text-foreground transition-all duration-150 rounded group relative"
              onClick={(e) => handleQuickAction(e, () => onCopyWithVariables(prompt))}
              title={hasVariables(prompt.content) ? t('ui_copyWithVariables') : t('ui_copy')}
            >
              <Icons.copy className="w-3 h-3" />
              {hasVariables(prompt.content) && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-primary/10 hover:bg-primary/20 border-0 text-primary hover:text-primary transition-all duration-150 rounded group relative"
              onClick={(e) => handleQuickAction(e, () => onInjectWithVariables(prompt))}
              title={hasVariables(prompt.content) ? t('ui_injectWithVariables') : t('ui_inject')}
            >
              <Icons.star className="w-3 h-3" />
              {hasVariables(prompt.content) && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
              )}
            </Button>
          </div>
        </div>

        {/* 悬浮时显示更多操作 - 不改变卡片大小 */}
        {isHovered && (
          <div className="absolute top-2 right-2 flex gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1 border border-border/50 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 border-0"
              onClick={(e) => handleQuickAction(e, () => onEditPrompt(prompt))}
              title={t('ui_edit')}
            >
              <Icons.edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 border-0"
              onClick={(e) => handleQuickAction(e, () => onDeletePrompt(prompt))}
              title={t('ui_delete')}
            >
              <Icons.trash className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* 展开预览区域 - 在卡片下方 */}
      <div className={cn('prompt-card-content mt-2 mx-3 bg-muted/30 rounded-lg border border-border/40 overflow-hidden', isExpanded && 'expanded')}>
        <div className="p-3 space-y-3">
          {/* 完整内容预览 */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
              {t('ui_fullContent')}
            </div>
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap bg-background/60 rounded p-2 border border-border/30">
              {prompt.content}
            </div>
          </div>

          {/* 变量信息 */}
          {hasVariables(prompt.content) && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                变量信息
              </div>
              <div className="flex flex-wrap gap-1.5">
                {extractVariables(prompt.content).map((variable, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs bg-primary/10 text-primary/80 rounded-md border border-primary/20"
                  >
                    {variable.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 统计信息 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground/70 pt-2 border-t border-border/30">
            <span>使用次数: {prompt.usageCount || 0}</span>
            <span>创建时间: {new Date(prompt.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VirtualizedPromptList: React.FC<VirtualizedPromptListProps> = ({
  prompts,
  selectedPrompt,
  expandedPromptId,
  onPromptSelect,
  onToggleExpand,
  onCopyWithVariables,
  onInjectWithVariables,
  onToggleFavorite,
  onEditPrompt,
  onDeletePrompt,
  height,
}) => {
  const { t } = useTranslation();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<any>(null);
  
  // 使用固定高度或动态计算，避免ResizeObserver循环
  const containerHeight = React.useMemo(() => {
    return height || 400;
  }, [height]);
  

  const itemData = React.useMemo(() => ({
    prompts,
    selectedPrompt,
    expandedPromptId,
    onPromptSelect,
    onToggleExpand,
    onCopyWithVariables,
    onInjectWithVariables,
    onToggleFavorite,
    onEditPrompt,
    onDeletePrompt,
  }), [
    prompts,
    selectedPrompt,
    expandedPromptId,
    onPromptSelect,
    onToggleExpand,
    onCopyWithVariables,
    onInjectWithVariables,
    onToggleFavorite,
    onEditPrompt,
    onDeletePrompt,
  ]);

  if (prompts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground">{t('ui_noPrompts')}</div>
          <div className="text-xs text-muted-foreground">{t('ui_createFirstPrompt')}</div>
        </div>
      </div>
    );
  }

  // 稳定的高度计算 - 减少抖动
  const getItemSize = React.useCallback((index: number) => {
    const prompt = prompts[index];
    if (!prompt) return 120;
    
    // 使用固定高度减少计算复杂度
    const baseHeight = 120; // 基础高度
    
    // 展开状态下的额外高度
    if (expandedPromptId === prompt.id) {
      // 使用固定值减少计算变动
      let expandedHeight = 200; // 基础展开高度
      
      // 根据内容长度简单调整
      if (prompt.content.length > 200) {
        expandedHeight += Math.min(Math.floor(prompt.content.length / 100) * 20, 100);
      }
      
      // 变量额外高度
      if (hasVariables(prompt.content)) {
        const variableCount = extractVariables(prompt.content).length;
        expandedHeight += Math.min(variableCount * 15, 60);
      }
      
      return baseHeight + expandedHeight;
    }
    
    // 根据内容微调基础高度
    if (prompt.description && prompt.description.length > 50) {
      return baseHeight + 20;
    }
    
    return baseHeight;
  }, [prompts, expandedPromptId]);

  return (
    <div ref={containerRef} className="h-full w-full virtualized-list-container">
      <List
        ref={listRef}
        height={containerHeight}
        itemCount={prompts.length}
        itemSize={getItemSize}
        itemData={itemData}
        width="100%"
        estimatedItemSize={120}
        overscanCount={2}
        useIsScrolling={false}
        layout="vertical"
        children={PromptItem}
      />
    </div>
  );
};

VirtualizedPromptList.displayName = 'VirtualizedPromptList';
