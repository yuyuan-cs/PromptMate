import * as React from "react";
import { cn } from "../../lib/utils";
import { LoadingSpinner } from "./loading-spinner";

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: "sm" | "md" | "lg";
}

// 通用加载状态组件
const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, text = "加载中...", size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-2 py-8",
          className
        )}
        {...props}
      >
        <LoadingSpinner size={size} />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    );
  }
);

LoadingState.displayName = "LoadingState";

// 按钮内加载状态
interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

const ButtonLoading: React.FC<ButtonLoadingProps> = ({ 
  isLoading, 
  children, 
  loadingText 
}) => {
  if (isLoading) {
    return (
      <>
        <LoadingSpinner size="sm" className="mr-2" />
        {loadingText || children}
      </>
    );
  }
  return <>{children}</>;
};

// 内联加载状态
interface InlineLoadingProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md";
}

const InlineLoading = React.forwardRef<HTMLSpanElement, InlineLoadingProps>(
  ({ className, size = "sm", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center", className)}
        {...props}
      >
        <LoadingSpinner size={size} />
      </span>
    );
  }
);

InlineLoading.displayName = "InlineLoading";

export { LoadingState, ButtonLoading, InlineLoading };
