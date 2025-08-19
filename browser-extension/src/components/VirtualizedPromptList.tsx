import * as React from 'react';
import { VariableSizeList as List } from 'react-window';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Icons } from './ui/icons';
import { cn } from '../lib/utils';
import { Prompt } from '../shared/types';
import { hasVariables } from '../shared/variableUtils';

interface VirtualizedPromptListProps {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  onPromptSelect: (prompt: Prompt) => void;
  onCopyWithVariables: (prompt: Prompt) => void;
  onInjectWithVariables: (prompt: Prompt) => void;
  onToggleFavorite: (promptId: string) => void;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (prompt: Prompt) => void;
  height: number;
}

interface PromptItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    prompts: Prompt[];
    selectedPrompt: Prompt | null;
    onPromptSelect: (prompt: Prompt) => void;
    onCopyWithVariables: (prompt: Prompt) => void;
    onInjectWithVariables: (prompt: Prompt) => void;
    onToggleFavorite: (promptId: string) => void;
    onEditPrompt: (prompt: Prompt) => void;
    onDeletePrompt: (prompt: Prompt) => void;
    expandedStates: Record<number, boolean>;
    toggleExpanded: (index: number) => void;
  };
}

const PromptItem: React.FC<PromptItemProps> = ({ index, style, data }) => {
  const {
    prompts,
    selectedPrompt,
    onPromptSelect,
    onCopyWithVariables,
    onInjectWithVariables,
    onToggleFavorite,
    onEditPrompt,
    onDeletePrompt,
    expandedStates,
    toggleExpanded,
  } = data;

  const prompt = prompts[index];
  const [isHovered, setIsHovered] = React.useState(false);
  const isExpanded = expandedStates[index] || false;
  
  if (!prompt) return null;

  // 点击主区域展开/收起预览
  const handleMainClick = () => {
    toggleExpanded(index);
    onPromptSelect(prompt);
  };

  // 快速操作处理
  const handleQuickAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div style={style} className="px-3 pb-1">
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
              title={`复制${hasVariables(prompt.content) ? ' (含变量)' : ''}`}
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
              title={`注入${hasVariables(prompt.content) ? ' (含变量)' : ''}`}
            >
              <Icons.send className="w-3 h-3" />
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
              title="编辑"
            >
              <Icons.edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 border-0"
              onClick={(e) => handleQuickAction(e, () => onDeletePrompt(prompt))}
              title="删除"
            >
              <Icons.trash className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* 展开预览区域 - 在卡片下方 */}
      {isExpanded && (
        <div className="mt-2 mx-3 bg-muted/30 rounded-lg border border-border/40 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 space-y-3">
            {/* 完整内容预览 */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                完整内容
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
                      {generateVariableLabel(variable)}
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
      )}
    </div>
  );
};

export const VirtualizedPromptList: React.FC<VirtualizedPromptListProps> = ({
  prompts,
  selectedPrompt,
  onPromptSelect,
  onCopyWithVariables,
  onInjectWithVariables,
  onToggleFavorite,
  onEditPrompt,
  onDeletePrompt,
  height,
}) => {
  // 管理所有卡片的展开状态
  const [expandedStates, setExpandedStates] = React.useState<Record<number, boolean>>({});
  
  // 切换展开状态
  const toggleExpanded = (index: number) => {
    setExpandedStates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const itemData = React.useMemo(() => ({
    prompts,
    selectedPrompt,
    onPromptSelect,
    onCopyWithVariables,
    onInjectWithVariables,
    onToggleFavorite,
    onEditPrompt,
    onDeletePrompt,
    expandedStates,
    toggleExpanded,
  }), [
    prompts,
    selectedPrompt,
    onPromptSelect,
    onCopyWithVariables,
    onInjectWithVariables,
    onToggleFavorite,
    onEditPrompt,
    onDeletePrompt,
    expandedStates,
    toggleExpanded,
  ]);

  if (prompts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground">暂无提示词</div>
          <div className="text-xs text-muted-foreground">点击"新建"创建您的第一个提示词</div>
        </div>
      </div>
    );
  }

  // 自适应高度计算 - 根据展开状态动态调整
  const getItemSize = React.useCallback((index: number) => {
    const prompt = prompts[index];
    if (!prompt) return 82;
    
    // 基础高度：固定部分 (紧凑设计)
    let height = 24; // padding: 12px * 2
    height += 20; // 标题行：20px
    height += 24; // 按钮行：24px
    height += 4;  // 按钮上间距：4px
    
    // 可选内容高度 (紧凑间距)
    if (prompt.description && prompt.description.trim()) {
      height += 16; // 描述行：16px
      height += 3;  // 描述下间距：3px
    }
    
    if (prompt.tags.length > 0) {
      height += 14; // 标签行：14px
      height += 3;  // 标签下间距：3px
    }
    
    // 展开预览区域高度 (动态计算)
    if (expandedStates[index]) {
      // 预览区域基础高度
      height += 8;  // 上边距：mt-2
      height += 24; // 内边距：p-3
      height += 16; // 标题：text-xs
      height += 8;  // 标题下间距
      
      // 内容区域高度 (根据内容长度估算)
      const contentLines = Math.ceil(prompt.content.length / 60); // 假设每行60字符
      height += Math.max(contentLines * 18, 36); // 最小36px，每行18px
      height += 8; // 内容下间距
      
      // 变量信息高度
      if (hasVariables(prompt.content)) {
        height += 16; // 变量标题
        height += 8;  // 标题下间距
        height += 24; // 变量标签行
        height += 8;  // 变量下间距
      }
      
      // 统计信息高度
      height += 20; // 统计行
      height += 12; // 底部间距
    }
    
    // 最小高度，确保按钮可点击
    return Math.max(height, 82);
  }, [prompts, expandedStates]);

  return (
    <List
      height={height}
      itemCount={prompts.length}
      itemSize={getItemSize}
      itemData={itemData}
      width="100%"
      estimatedItemSize={100}
    >
      {PromptItem}
    </List>
  );
};

