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
    const [isInlineEditing, setIsInlineEditing] = React.useState(false);
    const [editingContent, setEditingContent] = React.useState(prompt.content);

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

    // 行内编辑处理
    const handleStartInlineEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsInlineEditing(true);
      setEditingContent(prompt.content);
    };

    const handleSaveInlineEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (editingContent.trim() !== prompt.content) {
        // 创建更新后的提示词对象
        const updatedPrompt = { ...prompt, content: editingContent.trim() };
        onEdit(updatedPrompt);
      }
      setIsInlineEditing(false);
    };

    const handleCancelInlineEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingContent(prompt.content);
      setIsInlineEditing(false);
    };

    // 复制
    const handleCopy = () => {
      navigator.clipboard.writeText(prompt.content);
    };  

    // 同步外部更新
    React.useEffect(() => {
      setEditingContent(prompt.content);
    }, [prompt.content]);

    return (
      <div
        ref={ref}
        className="prompt-card-wrapper px-3 pb-1"
        style={{ contain: 'layout style paint' }}
      >
        <div
          // className={cn(
          //   "group relative bg-background transition-all duration-200 ease-out cursor-pointer",
          //   // 默认状态 - 极简边框
          //   "border border-border/60 rounded-lg",
          //   // 悬浮状态 - 微妙提升
          //   "hover:border-border/85 hover:shadow-sm hover:bg-background/80",
          //   // 选中状态 - 强化视觉区分
          //   isSelected && "ring-2 ring-primary/50 border-primary/70 bg-primary/8 shadow-md relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-l-lg",
          //   // 展开状态 - 明确反馈
          //   isExpanded && "border-primary/60 bg-primary/6 shadow-sm relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/80 before:rounded-l-lg"
          // )}
          className={cn(
            // 基础样式
            "group relative bg-background transition-all duration-200 ease-out cursor-pointer",
            "border border-border/60 rounded-lg",
          
            // 悬浮状态 - 保持微妙的反馈
            "hover:border-border/85 hover:shadow-sm hover:bg-background/80 hover:scale-105",
          
            // 当处于 选中 或 展开 状态时，添加左侧竖线的通用结构
            (isSelected || isExpanded) && "relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-lg",
          
            // 展开状态 - 仅使用阴影、细微背景色和竖线颜色来指示
            isExpanded && "shadow-sm bg-primary/6 before:bg-primary/80",
            
          //   // 选中状态 (优先级最高) - 使用更强的阴影、细微背景色和实色竖线来指示
          //   isSelected && "shadow-md bg-primary/8 before:bg-primary",
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleMainClick}
        >
          {/* 第一层：核心信息区 - 压缩空间 */}
          <div className="p-2.5 cursor-pointer min-h-0 flex flex-col">
            {/* 标题和标签行 - 合并到一行 */}
            <div className="flex items-center justify-between mb-1 min-h-[18px]">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 shrink-0 opacity-50 hover:opacity-90 border-0"
                  onClick={(e) => handleQuickAction(e, () => onToggleFavorite(prompt.id))}
                >
                  <Icons.star 
                    className={cn(
                      "w-2 h-2 transition-all duration-200",
                      prompt.isFavorite ? "fill-amber-400 text-amber-400 scale-110" : "text-muted-foreground/50"
                    )}
                  />
                </Button>
                <h3 className="font-medium text-sm leading-tight flex-1 min-w-0 truncate">
                  {prompt.title}
                </h3>
                
                {/* 标签紧跟标题 - 同一行显示 */}
                {prompt.tags.length > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 bg-muted/50 text-muted-foreground/80 rounded-full leading-none">
                      {prompt.tags[0]}
                    </span>
                    {prompt.tags.length > 1 && (
                      <span className="text-[10px] px-1 py-0.5 text-muted-foreground/50 leading-none">
                        +{prompt.tags.length - 1}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* 使用统计 - 更紧凑 */}
              {prompt.usageCount !== undefined && prompt.usageCount > 0 && (
                <div className="flex items-center shrink-0 ml-2">
                  <span className="text-xs font-medium text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-full leading-none">
                    {prompt.usageCount}
                  </span>
                </div>
              )}
            </div>

            {/* 描述行 - 可选，更紧凑 */}
            {prompt.description && (
              <p className="text-xs text-muted-foreground/70 leading-relaxed mb-1 line-clamp-1 ml-4">
                {prompt.description}
              </p>
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
            {/* 完整内容预览 - 支持行内编辑 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                  {t('prompts_promptContent')}
                </div>
                <div className="flex items-center gap-1">
                  {/* 行内编辑按钮 */}
                  {!isInlineEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 border-0"
                      onClick={handleStartInlineEdit}
                      title={t('common_edit')}
                    >
                      <Icons.edit className="w-3 h-3" />
                    </Button>
                  )}
                  {/* 复制按钮 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy();
                    }}
                    title={t('common_copy')}
                  >
                    <Icons.copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* 内容区域 - 编辑模式或预览模式 */}
              {isInlineEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full min-h-[120px] text-sm text-foreground bg-background rounded p-2 border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-y"
                    placeholder={t('prompts_promptContent')}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={handleCancelInlineEdit}
                    >
                      {t('common_cancel')}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={handleSaveInlineEdit}
                      disabled={editingContent.trim() === prompt.content}
                    >
                      {t('common_save')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-foreground/90 leading-relaxed bg-background/60 rounded p-2 border border-border/30 markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {prompt.content}
                  </ReactMarkdown>
                </div>
              )}
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

            {/* 统计信息 - 增强显示 */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground/70">{t('ui_usageCount')}:</span>
                  <span className="text-xs font-medium text-primary/80 bg-primary/10 px-2 py-1 rounded-full">
                    {prompt.usageCount || 0}
                  </span>
                </div>
                {(prompt.usageCount || 0) > 0 && (
                  <span className="text-xs text-green-600/80 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    {(prompt.usageCount || 0) >= 10 ? '热门' : (prompt.usageCount || 0) >= 5 ? '常用' : '已用'}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground/70">
                {t('ui_createTime')}: {new Date(prompt.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PromptCard.displayName = 'PromptCard';
