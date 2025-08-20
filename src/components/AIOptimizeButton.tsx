import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { aiService, AIOptimizeResponse, StreamCallback } from "@/services/aiService";
import { AIOptimizeDialog } from "./AIOptimizeDialog";
import { useToast } from "@/hooks/use-toast";

interface AIOptimizeButtonProps {
  content: string;
  title?: string;
  onOptimize: (optimizedContent: string) => void;
  disabled?: boolean;
  className?: string;
  onOpenSettings?: () => void;
  variant?: 'floating' | 'inline'; // 新增：支持浮动和内联两种模式
}

export const AIOptimizeButton: React.FC<AIOptimizeButtonProps> = ({
  content,
  title = "",
  onOptimize,
  disabled = false,
  className = "",
  onOpenSettings,
  variant = 'floating',
}) => {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<AIOptimizeResponse | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  // 检测是否有内容和AI配置
  useEffect(() => {
    const trimmedContent = content.trim();
    const trimmedTitle = title.trim();
    setHasContent(trimmedContent.length > 0 || trimmedTitle.length > 0);
    setIsConfigured(aiService.isConfigured());
  }, [content, title]);

  // 定期检查AI配置状态变化
  useEffect(() => {
    const checkConfig = () => {
      const currentConfig = aiService.isConfigured();
      if (currentConfig !== isConfigured) {
        setIsConfigured(currentConfig);
      }
    };

    // 立即检查一次
    checkConfig();

    // 设置定时器，每2秒检查一次配置状态
    const interval = setInterval(checkConfig, 2000);

    // 清理定时器
    return () => clearInterval(interval);
  }, [isConfigured]);

  const handleOptimize = async () => {
    // 检查AI服务是否已配置
    if (!aiService.isConfigured()) {
      toast({
        title: "AI服务未配置",
        description: "请先在设置中配置AI服务",
        variant: "destructive",
        action: onOpenSettings ? (
          <Button variant="outline" size="sm" onClick={onOpenSettings}>
            <Settings className="h-4 w-4 mr-2" />
            去设置
          </Button>
        ) : undefined,
      });
      return;
    }

    // 如果正在优化但对话框已关闭，重新打开对话框显示进度
    if (isOptimizing && !showDialog) {
      setShowDialog(true);
      return;
    }

    // 如果已经在优化且对话框已打开，或者被禁用，则不执行
    if ((isOptimizing && showDialog) || disabled) return;

    setIsOptimizing(true);
    setShowDialog(true);
    setOptimizeResult(null);
    setStreamingContent('');
    setIsStreaming(true);

    // 流式回调
    const streamCallback: StreamCallback = {
      onChunk: (chunk: string) => {
        setStreamingContent(prev => prev + chunk);
      },
      onComplete: (fullResponse: string) => {
        setIsStreaming(false);
        // 解析完整响应
        const result = aiService.parseResponse(fullResponse);
        // 如果解析结果为空，使用流式累积内容作为回退
        if (!result.optimizedContent || result.optimizedContent.trim().length === 0) {
          const fallback = streamingContent && streamingContent.trim().length > 0
            ? aiService.parseResponse(streamingContent)
            : { optimizedContent: fullResponse, explanation: '', suggestions: [] } as AIOptimizeResponse;
          setOptimizeResult(fallback);
        } else {
          setOptimizeResult(result);
        }
      },
      onError: (error: Error) => {
        setIsStreaming(false);
        setShowDialog(false);
        toast({
          title: "AI优化失败",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    try {
      const cfg = aiService.getConfig();
      const payload = { content, title, mode: hasContent ? 'optimize' : 'generate' } as const;
      if (cfg?.provider === 'gemini') {
        // 对Gemini使用非流式，避免实验模型SSE兼容问题
        setIsStreaming(false);
        const res = await aiService.optimizePrompt(payload);
        setOptimizeResult(res);
      } else {
        await aiService.optimizePrompt(payload, streamCallback);
      }
    } catch (error) {
      console.error('AI优化失败:', error);
      setIsStreaming(false);
      setShowDialog(false);
      toast({
        title: "AI优化失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // 接受优化结果
  const handleAcceptResult = (optimizedContent: string) => {
    onOptimize(optimizedContent);
    setShowDialog(false);
    setOptimizeResult(null);
    setStreamingContent('');
    toast({
      title: "优化完成",
      description: "AI优化的内容已应用",
      variant: "success",
    });
  };

  // 拒绝优化结果
  const handleRejectResult = () => {
    setShowDialog(false);
    setOptimizeResult(null);
    setStreamingContent('');
  };

  const tooltipText = hasContent 
    ? "使用AI优化当前提示词" 
    : "使用AI生成新的提示词";

  // 根据variant决定按钮样式
  const getButtonStyles = () => {
    if (variant === 'inline') {
      return cn(
        "w-8 h-8 rounded-full shadow-md border-0 p-0",
        "hover:shadow-lg hover:scale-110 transition-all duration-200",
        !isConfigured 
          ? "bg-gray-500 hover:bg-gray-600 text-white"
          : isOptimizing && !showDialog
            ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white animate-pulse"
            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white",
        !isOptimizing && !disabled && isConfigured && "animate-breathing",
        className
      );
    }
    
    // 浮动模式（原有样式）
    return cn(
      "fixed bottom-6 right-6 z-50 rounded-full shadow-lg",
      !isConfigured 
        ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
        : isOptimizing && !showDialog
          ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 animate-pulse"
          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      "text-white border-0 min-w-[120px] h-12",
      !isOptimizing && !disabled && "animate-breathing",
      "hover:shadow-xl hover:scale-105 transition-all duration-300",
      className
    );
  };

  // 如果未配置AI服务，显示不同的按钮样式
  if (!isConfigured) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onOpenSettings}
              disabled={disabled}
              className={getButtonStyles()}
            >
              {variant === 'inline' ? (
                <Settings className="h-2 w-2" />
              ) : (
                <>
                  <Settings className="h-2 w-2 mr-2" />
                  配置AI
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={variant === 'inline' ? 'top' : 'left'}>
            <p>点击配置AI服务以启用优化功能</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleOptimize}
              disabled={disabled}
              className={getButtonStyles()}
            >
              {isOptimizing ? (
                showDialog ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  // 显示可重新打开的状态
                  <div className="relative">
                    <Sparkles className="h-4 w-4" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-ping" />
                  </div>
                )
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {variant === 'floating' && (
                <span className="ml-2">
                  {isOptimizing ? '优化中...' : (hasContent ? 'AI优化' : 'AI生成')}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={variant === 'inline' ? 'top' : 'left'}>
            <p>
              {isOptimizing && !showDialog 
                ? "点击查看AI优化进度" 
                : tooltipText
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* AI优化结果对话框 */}
      <AIOptimizeDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        result={optimizeResult}
        onAccept={handleAcceptResult}
        onReject={handleRejectResult}
        isLoading={isOptimizing}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
      />
    </>
  );
};

// CSS动画样式（需要添加到全局CSS中）
export const aiOptimizeButtonStyles = `
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 8px 30px rgba(168, 85, 247, 0.6);
  }
}

.animate-breathe {
  animation: breathe 2s ease-in-out infinite;
}
`;
