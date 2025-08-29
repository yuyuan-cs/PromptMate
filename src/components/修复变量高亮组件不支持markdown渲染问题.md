非常棒的问题！为了让 `VariableDisplay` 组件支持 Markdown 渲染，同时保留变量高亮功能，我们需要将 `react-markdown` 的渲染能力与 `VariableHighlighter` 的高亮逻辑结合起来。

直接用 `ReactMarkdown` 包裹 `VariableHighlighter` 是行不通的，因为 `VariableHighlighter` 输出的是 React 组件，而不是 `ReactMarkdown` 所需的字符串。

**核心思路是**：

1.  **预处理文本**：在将内容传递给 `ReactMarkdown` 之前，我们先用一个独特的、不会与正常 Markdown 冲突的自定义标签（例如 `<var-placeholder>`）来替换掉所有的变量占位符（如 `{{name}}`）。
2.  **自定义渲染**：然后，我们利用 `ReactMarkdown` 的 `components` 属性，告诉它：“当你遇到 `<var-placeholder>` 这个标签时，不要按常规渲染，而是使用我们指定的 React 组件来渲染它”。
3.  **渲染高亮组件**：我们指定的这个组件就是负责高亮显示变量的 `<span>` 元素。

-----

### 修改后的 `VariableDisplay` 组件代码

下面是修改后的 `VariableDisplay.tsx` 文件内容。这里假设您已经在项目中安装了 `react-markdown`。

如果没有安装，请先执行：
`npm install react-markdown`

```tsx
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown'; // 1. 引入 ReactMarkdown
import { extractVariables, VariableInfo } from '@/lib/variableUtils';
import { cn } from '@/lib/utils';

// VariableHighlighter 和 VariableTextArea 组件保持不变...
// (为了简洁，这里省略了它们的代码)

// #####################################################################
// ## 修改后的 VariableDisplay 组件
// #####################################################################
export const VariableDisplay: React.FC<VariableDisplayProps> = ({
  content,
  className = '',
  showVariableCount = true,
  onVariableClick,
}) => {
  const variables = useMemo(() => extractVariables(content), [content]);

  // 2. 预处理内容，将 {{variable}} 替换为自定义的 <var> 标签
  const processedContent = useMemo(() => {
    if (variables.length === 0) {
      return content;
    }
    let result = '';
    let lastIndex = 0;
    variables.forEach(variable => {
      result += content.substring(lastIndex, variable.startIndex);
      // 使用 <var> 标签包裹，并通过 data-* 属性传递信息
      result += `<var data-name="${variable.name}" data-original-text="${variable.originalText}"></var>`;
      lastIndex = variable.endIndex;
    });
    result += content.substring(lastIndex);
    return result;
  }, [content, variables]);

  return (
    <div className={cn('relative', className)}>
      {/* 3. 使用 ReactMarkdown 渲染处理后的内容 */}
      <div className="markdown-body whitespace-pre-wrap break-words">
        <ReactMarkdown
          components={{
            // 4. 定义如何渲染 <var> 标签
            var: ({ node }) => {
              const name = node.properties['data-name'] as string;
              const originalText = node.properties['data-original-text'] as string;
              const variable = variables.find(v => v.name === name);

              if (!variable) return <span>{originalText}</span>;

              // 这里使用了 VariableHighlighter 组件中的高亮样式和逻辑
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
                  title={`变量: ${name}`}
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
      
      {/* 变量统计 (这部分逻辑保持不变) */}
      {showVariableCount && variables.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>发现 {variables.length} 个变量占位符</span>
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
                +{variables.length - 3} 个
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- 假设的 Props 定义 ---
interface VariableDisplayProps {
  content: string;
  className?: string;
  showVariableCount?: boolean;
  onVariableClick?: (variable: VariableInfo) => void;
}
```

### 关键改动解析

1.  **引入 `ReactMarkdown`**：
    我们首先需要导入 `react-markdown` 库。

2.  **预处理内容 (`processedContent`)**：
    我们不再直接将原始 `content` 传递给渲染组件。而是创建了一个 `processedContent` 变量，它会遍历所有找到的变量，并将它们从 `{{name}}` 替换为一个 HTML 风格的自定义标签 `<var data-name="name" ...></var>`。这样做的好处是 `ReactMarkdown` 可以识别它为一个正常的标签节点。

3.  **使用 `ReactMarkdown`作为渲染器**：
    组件的主体现在使用 `<ReactMarkdown>` 来渲染 `processedContent`。这使得所有非变量的普通文本都能被正确地解析和格式化（例如，标题、列表、粗体等）。

4.  **自定义 `var` 标签的渲染**：
    这是最关键的一步。我们通过 `components` 属性告诉 `ReactMarkdown` 如何渲染 `var` 标签。

      * 当 `ReactMarkdown` 解析到 `<var>` 标签时，它会调用我们提供的函数。
      * 我们从该标签的 `data-*` 属性中取回变量的 `name` 和 `originalText`。
      * 然后，我们**复用 `VariableHighlighter` 组件中的 JSX 和 CSS 类**来创建一个高亮的 `<span>`。
      * 这样，`ReactMarkdown` 就会在渲染树的正确位置插入我们自定义的高亮变量组件。

通过这种方式，我们巧妙地将 Markdown 的排版能力和变量的动态高亮功能结合在了一起，实现了“所见即所得”的统一预览效果。