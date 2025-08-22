import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Sparkles, Loader2, Settings } from 'lucide-react';
import { aiService, AIOptimizeResponse, StreamCallback } from '../services/aiService';
import { AIOptimizeDialog } from './AIOptimizeDialog';

interface AIOptimizeButtonProps {
  content: string;
  title?: string;
  onOptimize: (optimizedContent: string) => void;
  disabled?: boolean;
  className?: string;
  onOpenSettings?: () => void;
  variant?: 'floating' | 'inline';
}

export const AIOptimizeButton: React.FC<AIOptimizeButtonProps> = ({
  content,
  title = "",
  onOptimize,
  disabled = false,
  className = "",
  onOpenSettings,
  variant = 'inline',
}) => {
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

    checkConfig();
    const interval = setInterval(checkConfig, 2000);
    return () => clearInterval(interval);
  }, [isConfigured]);

  const handleOptimize = async () => {
    // 检查AI服务是否已配置
    if (!aiService.isConfigured()) {
      if (onOpenSettings) {
        onOpenSettings();
      }
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
        console.error('AI优化失败:', error);
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
    const baseStyles = "transition-all duration-200";
    
    if (variant === 'inline') {
      return `${baseStyles} ${className}`;
    }
    
    // 浮动模式
    return `fixed bottom-6 right-6 z-50 rounded-full shadow-lg text-white border-0 min-w-[120px] h-12 hover:shadow-xl hover:scale-105 transition-all duration-300 ${className}`;
  };

  // 如果未配置AI服务，显示配置按钮
  if (!isConfigured) {
    return (
      <Button
        onClick={onOpenSettings}
        disabled={disabled}
        className={getButtonStyles()}
        variant={variant === 'inline' ? 'outline' : 'default'}
        title="点击配置AI服务以启用优化功能"
      >
        {variant === 'inline' ? (
          <>
            <Settings className="h-4 w-4 mr-2" />
            配置AI
          </>
        ) : (
          <>
            <Settings className="h-4 w-4 mr-2" />
            配置AI
          </>
        )}
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleOptimize}
        disabled={disabled}
        className={getButtonStyles()}
        variant={variant === 'inline' ? 'outline' : 'default'}
        title={isOptimizing && !showDialog ? "点击查看AI优化进度" : tooltipText}
      >
        {isOptimizing ? (
          showDialog ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <div className="relative mr-2">
              <Sparkles className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-ping" />
            </div>
          )
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        {isOptimizing ? '优化中...' : (hasContent ? 'AI优化' : 'AI生成')}
      </Button>

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
