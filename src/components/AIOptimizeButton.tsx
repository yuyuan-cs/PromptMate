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
}

export const AIOptimizeButton: React.FC<AIOptimizeButtonProps> = ({
  content,
  title = "",
  onOptimize,
  disabled = false,
  className = "",
  onOpenSettings,
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

    if (isOptimizing || disabled) return;

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
        setOptimizeResult(result);
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
      await aiService.optimizePrompt({
        content,
        title,
        mode: hasContent ? 'optimize' : 'generate'
      }, streamCallback);
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

  const buttonText = hasContent ? "AI优化" : "AI生成";
  const tooltipText = hasContent 
    ? "使用AI优化当前提示词" 
    : "使用AI生成新的提示词";

  // 如果未配置AI服务，显示不同的按钮样式
  if (!isConfigured) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onOpenSettings}
              disabled={disabled}
              className={cn(
                "fixed bottom-6 right-6 z-50 rounded-full shadow-lg",
                "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
                "text-white border-0 min-w-[120px] h-12",
                "hover:shadow-xl hover:scale-105 transition-all duration-300",
                className
              )}
            >
              <Settings className="h-4 w-4 mr-2" />
              配置AI
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
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
              disabled={disabled || isOptimizing}
              className={cn(
                "fixed bottom-6 right-6 z-50 rounded-full shadow-lg",
                "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
                "text-white border-0 min-w-[120px] h-12",
                // 呼吸动画
                !isOptimizing && !disabled && "animate-pulse",
                // 悬浮效果
                "hover:shadow-xl hover:scale-105 transition-all duration-300",
                className
              )}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  优化中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {buttonText}
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{tooltipText}</p>
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
