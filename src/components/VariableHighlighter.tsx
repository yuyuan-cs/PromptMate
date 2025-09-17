import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { extractVariables, VariableInfo } from '@/lib/variableUtils';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { DynamicTextarea } from '@/components/ui/dynamic-textarea';

interface VariableHighlighterProps {
  content: string;
  className?: string;
  onVariableClick?: (variable: VariableInfo) => void;
  highlightClassName?: string;
}

export const VariableHighlighter: React.FC<VariableHighlighterProps> = ({
  content,
  className = '',
  onVariableClick,
  highlightClassName = '',
}) => {
  const { t } = useTranslation();
  // 提取变量信息
  const variables = useMemo(() => extractVariables(content), [content]);
  
  // 构建高亮后的内容
  const highlightedContent = useMemo(() => {
    // 如果没有变量，直接返回原内容
    if (variables.length === 0) {
      return [{ type: 'text' as const, content }];
    }
    
    const elements: Array<{ type: 'text' | 'variable'; content: string; variable?: VariableInfo }> = [];
    let lastIndex = 0;
    
    // 按位置顺序处理，避免索引变化
    for (let i = 0; i < variables.length; i++) {
      const variable = variables[i];
      
      // 添加变量前的文本
      if (variable.startIndex > lastIndex) {
        const beforeText = content.substring(lastIndex, variable.startIndex);
        if (beforeText) {
          elements.push({ type: 'text', content: beforeText });
        }
      }
      
      // 添加变量
      elements.push({ 
        type: 'variable', 
        content: variable.originalText, 
        variable 
      });
      
      // 更新最后处理的位置
      lastIndex = variable.endIndex;
    }
    
    // 添加最后一个变量后的文本
    if (lastIndex < content.length) {
      const afterText = content.substring(lastIndex);
      if (afterText) {
        elements.push({ type: 'text', content: afterText });
      }
    }
    
    return elements;
  }, [content, variables]);
  
  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Headers
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b border-border/50" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 pb-2 border-b border-border/30" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-base font-medium mt-3 mb-2" {...props} />,
          
          // Paragraphs
          p: ({node, ...props}) => <p className="my-3 leading-relaxed" {...props} />,
          
          // Lists
          ul: ({node, ...props}) => <ul className="list-disc pl-6 my-2 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-2 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="my-1 pl-1" {...props} />,
          
          // Code blocks
          pre: ({node, ...props}) => (
            <pre className="bg-muted/50 dark:bg-muted/20 p-4 rounded-lg overflow-x-auto my-4 text-sm border border-border/20" {...props} />
          ),
          code: ({node, className, children, ...props}: any) => {
            const inline = !className;
            if (inline) {
              // Check if it's a variable
              const content = String(children);
              const varMatch = content.match(/^\{\{([^}]+)\}\}$/);
              if (varMatch) {
                const varName = varMatch[1];
                const variable = variables.find(v => v.name === varName);
                
                if (variable) {
                  return (
                    <span
                      className={cn(
                        'variable-highlight inline-flex items-center px-2 py-1 mx-0.5 rounded-md text-sm font-mono',
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
                        'border border-blue-200 dark:border-blue-800/50',
                        'cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/60',
                        'transition-all duration-200 hover:scale-105',
                        highlightClassName
                      )}
                      onClick={() => onVariableClick?.(variable)}
                      title={`${t('variableHighlighter.variableLabel')}: ${variable.name}`}
                      data-variable={variable.name}
                    >
                      {content}
                    </span>
                  );
                }
              }
              
              // Regular inline code
              return (
                <code className="bg-muted/60 dark:bg-muted/40 px-1.5 py-0.5 rounded text-sm font-mono text-foreground/90 border border-border/20" {...props}>
                  {children}
                </code>
              );
            }
            
            // Code blocks
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          
          // Blockquotes
          blockquote: ({node, ...props}) => (
            <blockquote 
              className="border-l-4 border-primary/50 bg-muted/30 dark:bg-muted/10 pl-4 py-2 my-4 text-muted-foreground italic rounded-r-md" 
              {...props} 
            />
          ),
          
          // Links
          a: ({node, ...props}) => (
            <a 
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors decoration-primary/50 hover:decoration-primary" 
              target="_blank" 
              rel="noopener noreferrer"
              {...props} 
            />
          ),
          
          // Tables
          table: ({node, ...props}) => (
            <div className="my-4 border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-muted/50 dark:bg-muted/30" {...props} />,
          th: ({node, ...props}) => <th className="p-3 text-left border-b font-semibold text-foreground/90" {...props} />,
          td: ({node, ...props}) => <td className="p-3 border-t border-border/30" {...props} />,
          tr: ({node, ...props}) => <tr className="hover:bg-muted/30 transition-colors" {...props} />,
          
          // Horizontal rule
          hr: ({node, ...props}) => <hr className="my-6 border-t border-border/50" {...props} />,
          
          // Images
          img: ({node, ...props}) => (
            <div className="my-4 rounded-lg overflow-hidden border border-border/20 shadow-sm">
              <img className="max-w-full h-auto" {...props} />
            </div>
          ),
          
          // Strong and emphasis
          strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
          em: ({node, ...props}) => <em className="italic text-foreground/90" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// 用于在文本区域中显示变量高亮的组件
interface VariableTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
  showVariables?: boolean;
  showMarkdownPreview?: boolean; // 是否显示Markdown预览
  previewMode?: 'split' | 'tabs'; // 预览模式：分屏或标签页
  minHeight?: number; // 最小高度（像素）
  maxHeight?: number; // 最大高度（像素）
  enableResize?: boolean; // 是否允许手动调整大小
}

export const VariableTextArea: React.FC<VariableTextAreaProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  rows = 4,
  disabled = false,
  showVariables = true,
  showMarkdownPreview = false,
  previewMode = 'tabs',
  minHeight = 120,
  maxHeight = 400,
  enableResize = false,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview'>('edit');
  
  // 提取变量信息用于显示
  const variables = useMemo(() => extractVariables(value), [value]);
  
  // 如果不显示Markdown预览，使用原来的简单模式
  if (!showMarkdownPreview) {
    return (
      <div className="relative">
        {/* 文本输入区域 - 使用动态高度组件 */}
        <DynamicTextarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full border rounded-md p-3',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'bg-background text-foreground',
            'placeholder:text-muted-foreground',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          minHeight={minHeight}
          maxHeight={maxHeight}
          enableResize={enableResize}
          disabled={disabled}
        />
        
        {/* 变量高亮覆盖层（仅显示，不可编辑） */}
        {showVariables && variables.length > 0 && (
          <div
            className={cn(
              'variable-highlight-overlay',
              'text-foreground'
            )}
          >
            <VariableHighlighter
              content={value}
              highlightClassName="!bg-transparent !border-transparent !text-transparent"
            />
          </div>
        )}
        
        {/* 变量统计信息 */}
        {showVariables && variables.length > 0 && (
          <div className="absolute top-2 right-2 pointer-events-none">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
              {variables.length} {t('variableHighlighter.variableCount')}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 带Markdown预览的增强模式
  if (previewMode === 'split') {
    return (
      <div className={cn('grid grid-cols-2 gap-4', className)}>
        {/* 左侧：编辑区域 */}
        <div className="relative">
          <div className="text-xs text-muted-foreground mb-2">{t('common.edit')}</div>
          <DynamicTextarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'w-full border rounded-md p-3',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'bg-background text-foreground',
              'placeholder:text-muted-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            minHeight={minHeight}
            maxHeight={maxHeight}
            enableResize={enableResize}
            disabled={disabled}
          />
          
          {/* 变量统计信息 */}
          {showVariables && variables.length > 0 && (
            <div className="absolute top-8 right-2 pointer-events-none">
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
                {variables.length} {t('variableHighlighter.variableCount')}
              </div>
            </div>
          )}
        </div>
        
        {/* 右侧：预览区域 */}
        <div className="relative">
          <div className="text-xs text-muted-foreground mb-2">{t('common.markdownPreview')}</div>
          <div 
            className="border rounded-md p-3 bg-muted/30 overflow-auto"
            style={{ minHeight, maxHeight }}
          >
            {value ? (
              <VariableDisplay
                content={value}
                showVariableCount={false}
                className="prose prose-sm max-w-none"
              />
            ) : (
              <div className="text-muted-foreground text-sm">
                {t('common.markdownPreviewPlaceholder')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 标签页模式
  return (
    <div className={cn('space-y-2', className)}>
      {/* 标签页切换 */}
      <div className="flex border-b">
        <button
          type="button"
          className={cn(
            'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'edit'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('edit')}
        >
          {t('common.edit')}
          {showVariables && variables.length > 0 && (
            <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs px-1.5 py-0.5 rounded-full">
              {variables.length}
            </span>
          )}
        </button>
        <button
          type="button"
          className={cn(
            'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'preview'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('preview')}
        >
          {t('common.markdownPreview')}
        </button>
      </div>
      
      {/* 内容区域 */}
      <div className="relative">
        {activeTab === 'edit' ? (
          <div className="relative">
            <DynamicTextarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'w-full border rounded-md p-3',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'bg-background text-foreground',
                'placeholder:text-muted-foreground',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              minHeight={minHeight}
              maxHeight={maxHeight}
              enableResize={enableResize}
              disabled={disabled}
            />
            
            {/* 变量高亮覆盖层（仅显示，不可编辑） */}
            {showVariables && variables.length > 0 && (
              <div
                className={cn(
                  'variable-highlight-overlay',
                  'text-foreground'
                )}
              >
                <VariableHighlighter
                  content={value}
                  highlightClassName="!bg-transparent !border-transparent !text-transparent"
                />
              </div>
            )}
          </div>
        ) : (
          <div 
            className="border rounded-md p-3 bg-muted/30 overflow-auto"
            style={{ minHeight, maxHeight }}
          >
            {value ? (
              <VariableDisplay
                content={value}
                showVariableCount={showVariables}
                className="prose prose-sm max-w-none"
              />
            ) : (
              <div className="text-muted-foreground text-sm">
                {t('common.markdownPreviewPlaceholder')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 用于在只读模式下显示变量高亮的组件
interface VariableDisplayProps {
  content: string;
  className?: string;
  showVariableCount?: boolean;
  onVariableClick?: (variable: VariableInfo) => void;
}

export const VariableDisplay: React.FC<VariableDisplayProps> = ({
  content,
  className = '',
  showVariableCount = true,
  onVariableClick,
}) => {
  const { t } = useTranslation();
  const variables = useMemo(() => extractVariables(content), [content]);

  const processedContent = useMemo(() => {
    if (variables.length === 0) {
      return content;
    }
    
    let result = '';
    let lastIndex = 0;
    const sortedVariables = [...variables].sort((a, b) => a.startIndex - b.startIndex);
    
    // 过滤掉重叠的变量，避免冲突
    const filteredVariables = sortedVariables.filter((variable, index) => {
      if (index === 0) return true;
      const prevVariable = sortedVariables[index - 1];
      return variable.startIndex >= prevVariable.endIndex;
    });
    
    filteredVariables.forEach(variable => {
      // 添加变量前的文本
      result += content.substring(lastIndex, variable.startIndex);
      // 使用 data-variable-name 避免与HTML的 data-name 冲突
      result += `<var data-variable-name="${encodeURIComponent(variable.name)}">${variable.originalText}</var>`;
      lastIndex = variable.endIndex;
    });
    
    // 添加最后的文本
    result += content.substring(lastIndex);
    return result;
  }, [content, variables]);

  return (
    <div className={cn('relative prose prose-sm max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Headers
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b border-border/50" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 pb-2 border-b border-border/30" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-base font-medium mt-3 mb-2" {...props} />,
          
          // Paragraphs
          p: ({node, ...props}) => <p className="my-3 leading-relaxed" {...props} />,
          
          // Lists
          ul: ({node, ...props}) => <ul className="list-disc pl-6 my-2 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-2 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="my-1 pl-1" {...props} />,
          
          // Code blocks
          pre: ({node, ...props}) => (
            <pre className="bg-muted/50 dark:bg-muted/20 p-4 rounded-lg overflow-x-auto my-4 text-sm border border-border/20" {...props} />
          ),
          code: ({node, className, children, ...props}: any) => {
            const inline = !className;
            if (inline) {
              return (
                <code className="bg-muted/60 dark:bg-muted/40 px-1.5 py-0.5 rounded text-sm font-mono text-foreground/90 border border-border/20" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          
          // Blockquotes
          blockquote: ({node, ...props}) => (
            <blockquote 
              className="border-l-4 border-primary/50 bg-muted/30 dark:bg-muted/10 pl-4 py-2 my-4 text-muted-foreground italic rounded-r-md" 
              {...props} 
            />
          ),
          
          // Links
          a: ({node, ...props}) => (
            <a 
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors decoration-primary/50 hover:decoration-primary" 
              target="_blank" 
              rel="noopener noreferrer"
              {...props} 
            />
          ),
          
          // Tables
          table: ({node, ...props}) => (
            <div className="my-4 border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-muted/50 dark:bg-muted/30" {...props} />,
          th: ({node, ...props}) => <th className="p-3 text-left border-b font-semibold text-foreground/90" {...props} />,
          td: ({node, ...props}) => <td className="p-3 border-t border-border/30" {...props} />,
          tr: ({node, ...props}) => <tr className="hover:bg-muted/30 transition-colors" {...props} />,
          
          // Horizontal rule
          hr: ({node, ...props}) => <hr className="my-6 border-t border-border/50" {...props} />,
          
          // Images
          img: ({node, ...props}) => (
            <div className="my-4 rounded-lg overflow-hidden border border-border/20 shadow-sm">
              <img className="max-w-full h-auto" {...props} />
            </div>
          ),
          
          // Strong and emphasis
          strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
          em: ({node, ...props}) => <em className="italic text-foreground/90" {...props} />,
          
          // Variables
          var: ({ node, ...props }) => {
            // 从新的属性名获取变量名
            const encodedName = node.properties?.dataVariableName as string;
            const name = encodedName ? decodeURIComponent(encodedName) : 
                        (node.properties?.dataName as string); // 向后兼容
            
            const originalText = node.children?.[0]?.type === 'text' ? 
                                node.children[0].value : 
                                (typeof node.children?.[0] === 'string' ? node.children[0] : '');
            
            if (!name) return <span>{originalText}</span>;
            
            const variable = variables.find(v => v.name === name);
            if (!variable) return <span>{originalText}</span>;

            return (
              <span
                className={cn(
                  'variable-highlight inline-flex items-center px-2 py-1 mx-0.5 rounded-md text-sm font-mono',
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
                  'border border-blue-200 dark:border-blue-800/50',
                  'cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/60',
                  'transition-all duration-200 hover:scale-105'
                )}
                onClick={() => onVariableClick?.(variable)}
                title={`${t('variableHighlighter.variableLabel')}: ${name}`}
                data-variable={name}
              >
                {originalText}
              </span>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
      
      {showVariableCount && variables.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{t('variableHighlighter.foundVariables')} {variables.length} {t('variableHighlighter.variablePlaceholders')}</span>
          <div className="flex gap-1">
            {variables.slice(0, 3).map((variable) => (
              <span
                key={variable.name}
                className="bg-muted px-1.5 py-0.5 rounded text-xs"
              >
                {variable.name}
              </span>
            ))}
            {variables.length > 3 && (
              <span className="text-muted-foreground">
                +{variables.length - 3} {t('variableHighlighter.moreVariables')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};