import * as React from "react";
import { cn } from "@/lib/utils";

export interface DynamicTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number; // 最小高度（像素）
  maxHeight?: number; // 最大高度（像素）
  enableResize?: boolean; // 是否允许手动调整大小
}

/**
 * 动态高度文本输入框组件
 * 支持根据内容自动调整高度，达到最大高度后显示滚动条
 */
const DynamicTextarea = React.forwardRef<HTMLTextAreaElement, DynamicTextareaProps>(
  ({ className, minHeight = 80, maxHeight = 300, enableResize = false, ...props }, ref) => {
    const [height, setHeight] = React.useState<number>(minHeight);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // 合并 ref
    const mergedRef = React.useCallback((node: HTMLTextAreaElement) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    // 调整高度的函数
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // 重置高度为最小值，以便正确计算 scrollHeight
      textarea.style.height = `${minHeight}px`;
      
      // 获取实际需要的高度
      const scrollHeight = textarea.scrollHeight;
      
      // 计算新高度，限制在 minHeight 和 maxHeight 之间
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      
      // 设置新高度
      setHeight(newHeight);
      textarea.style.height = `${newHeight}px`;
      
      // 如果内容超过最大高度，启用滚动
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }, [minHeight, maxHeight]);

    // 监听内容变化
    const handleInput = React.useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
      // 调用原始的 onInput 处理器
      props.onInput?.(e);
      
      // 调整高度
      requestAnimationFrame(adjustHeight);
    }, [props.onInput, adjustHeight]);

    // 监听 onChange 事件
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // 调用原始的 onChange 处理器
      props.onChange?.(e);
      
      // 调整高度
      requestAnimationFrame(adjustHeight);
    }, [props.onChange, adjustHeight]);

    // 初始化时调整高度
    React.useEffect(() => {
      adjustHeight();
    }, [adjustHeight, props.value]);

    // 监听窗口大小变化，重新调整高度
    React.useEffect(() => {
      const handleResize = () => {
        requestAnimationFrame(adjustHeight);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [adjustHeight]);

    return (
      <textarea
        ref={mergedRef}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200 ease-in-out",
          !enableResize && "resize-none",
          className
        )}
        style={{
          height: `${height}px`,
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: height >= maxHeight ? 'auto' : 'hidden',
        }}
        {...props}
        onInput={handleInput}
        onChange={handleChange}
      />
    );
  }
);

DynamicTextarea.displayName = "DynamicTextarea";

export { DynamicTextarea };
