import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { Icons } from './ui/icons';
import { cn } from '../lib/utils';
import { Prompt } from '../shared/types';
import { hasVariables, extractVariables } from '../shared/variableUtils';
import { useTranslation } from '../i18n';

interface PromptCardProps {
  prompt: Prompt;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: (promptId: string) => void;
  onSelect: (prompt: Prompt) => void;
  onCopyWithVariables: (prompt: Prompt) => void;
  onInjectWithVariables: (prompt: Prompt) => void;
  onToggleFavorite: (promptId: string) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
}

export const PromptCard = React.forwardRef<HTMLDivElement, PromptCardProps>(
  (
    {
      prompt,
      isExpanded,
      isSelected,
      onToggleExpand,
      onSelect,
      onCopyWithVariables,
      onInjectWithVariables,
      onToggleFavorite,
      onEdit,
      onDelete,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = React.useState(false);

    // 点击主区域展开/收起预览
    const handleMainClick = () => {
      onToggleExpand(prompt.id);
      onSelect(prompt);
    };

    // 快速操作处理
    const handleQuickAction = (e: React.MouseEvent, action: () => void) => {
      e.stopPropagation();
      action();
    };

    return (
      <div
        ref={ref}
        className="prompt-card-wrapper px-3 pb-2"
        style={{ contain: 'layout style paint' }}
      >
        <div
          className={cn(
            "group relative bg-background transition-all duration-200 ease-out cursor-pointer",
            // 默认状态 - 极简边框
            "border border-border/60 rounded-lg",
            // 悬浮状态 - 微妙提升
            "hover:border-border/85 hover:shadow-sm hover:bg-background/80",
            // 选中状态 - 清晰标识
            isSelected && "ring-1 ring-primary/40 border-primary/50 bg-primary/5",
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
                title={`${t('action_copy')}${hasVariables(prompt.content) ? ` (${t('ui_withVariables')})` : ''}`}
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
                title={`${t('action_inject')}${hasVariables(prompt.content) ? ` (${t('ui_withVariables')})` : ''}`}
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
                onClick={(e) => handleQuickAction(e, () => onEdit(prompt))}
                title={t('common_edit')}
              >
                <Icons.edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 border-0"
                onClick={(e) => handleQuickAction(e, () => onDelete(prompt))}
                title={t('common_delete')}
              >
                <Icons.trash className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* 展开预览区域 - 在卡片下方，使用CSS动画 */}
        <div 
          className={cn(
            'prompt-card-content mt-2 mx-3 bg-muted/30 rounded-lg border border-border/40 overflow-hidden',
            isExpanded && 'expanded'
          )}
        >
          <div className="p-3 space-y-3">
            {/* 完整内容预览 */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                {t('prompts_promptContent')}
              </div>
              <div className="text-sm text-foreground/90 leading-relaxed bg-background/60 rounded p-2 border border-border/30 markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {prompt.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* 变量信息 */}
            {hasVariables(prompt.content) && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                  {t('ui_variableInfo')}
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
              <span>{t('ui_usageCount')}: {prompt.usageCount || 0}</span>
              <span>{t('ui_createTime')}: {new Date(prompt.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PromptCard.displayName = 'PromptCard';
