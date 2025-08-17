import React, { useMemo } from 'react';
import { extractVariables, VariableInfo } from '@/lib/variableUtils';
import { cn } from '@/lib/utils';

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
              title={`变量: ${element.variable.name}`}
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
}

export const VariableTextArea: React.FC<VariableTextAreaProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  rows = 4,
  disabled = false,
  showVariables = true,
}) => {
  // 提取变量信息用于显示
  const variables = useMemo(() => extractVariables(value), [value]);
  
  return (
    <div className="relative">
      {/* 文本输入区域 */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full resize-none border rounded-md p-3',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'bg-background text-foreground',
          'placeholder:text-muted-foreground',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        rows={rows}
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
            {variables.length} 个变量
          </div>
        </div>
      )}
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
  const variables = useMemo(() => extractVariables(content), [content]);
  
  return (
    <div className={cn('relative', className)}>
      {/* 变量高亮内容 */}
      <VariableHighlighter
        content={content}
        onVariableClick={onVariableClick}
        className="whitespace-pre-wrap break-words"
      />
      
      {/* 变量统计 */}
      {showVariableCount && variables.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>发现 {variables.length} 个变量占位符</span>
          <div className="flex gap-1">
            {variables.slice(0, 3).map((variable, index) => (
              <span
                key={index}
                className="bg-muted px-1.5 py-0.5 rounded text-xs"
              >
                {variable.name}
              </span>
            ))}
            {variables.length > 3 && (
              <span className="text-muted-foreground">
                +{variables.length - 3} 个
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 