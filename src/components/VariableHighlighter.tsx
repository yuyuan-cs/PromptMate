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
    <span className={className}>
      {highlightedContent.map((element, index) => {
        if (element.type === 'variable' && element.variable) {
          return (
            <span
              key={index}
              className={cn(
                'variable-highlight inline-block px-0.5 py-0.25 mx-0.5 rounded text-sm font-mono',
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                'border border-blue-200 dark:border-blue-800',
                'cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50',
                'transition-colors duration-200',
                highlightClassName
              )}
              onClick={() => onVariableClick?.(element.variable!)}
              title={`${t('variableHighlighter.variableLabel')}: ${element.variable.name}`}
              data-variable={element.variable.name}
            >
              {element.content}
            </span>
          );
        }
        
        return (
          <span key={index}>
            {element.content}
          </span>
        );
      })}
    </span>
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
    <div className={cn('relative', className)}>
      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
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
                    'variable-highlight inline-block px-0.5 py-0.25 mx-0.5 rounded text-sm font-mono',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                    'border border-blue-200 dark:border-blue-800',
                    'cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50',
                    'transition-colors duration-200'
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
      </div>
      
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