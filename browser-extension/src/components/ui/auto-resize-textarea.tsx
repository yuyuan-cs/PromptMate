import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
}

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className, onChange, minRows = 1, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  // 合并 refs
  React.useImperativeHandle(ref, () => textareaRef.current!);

  // 自动调整高度的函数
  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 重置高度以获取正确的 scrollHeight
      textarea.style.height = 'auto';
      // 设置为内容高度，最小高度基于 minRows
      const computedStyle = getComputedStyle(textarea);
      const lineHeight = parseFloat(computedStyle.lineHeight) || 20; // fallback to 20px
      const minHeight = Math.max(minRows * lineHeight, 32); // minimum 32px
      const newHeight = Math.max(textarea.scrollHeight, minHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [minRows]);

  // 处理输入变化
  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    // 延迟调整高度，确保内容已更新
    setTimeout(adjustHeight, 0);
  }, [onChange, adjustHeight]);

  // 初始化和值变化时调整高度
  React.useEffect(() => {
    adjustHeight();
  }, [props.value, adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        "flex min-h-[32px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden transition-all duration-200",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { AutoResizeTextarea };
