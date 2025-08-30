import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Sparkles, Settings } from 'lucide-react';
import { aiService, AIOptimizeResponse, StreamCallback } from '../services/aiService';
import { AIOptimizeDialog } from './AIOptimizeDialog';
import { useSidebarAlert } from '../hooks/useSidebarAlert';

interface AIOptimizeIconButtonProps {
  content: string;
  title?: string;
  onOptimize: (optimizedContent: string) => void;
  disabled?: boolean;
  className?: string;
  onOpenSettings?: () => void;
}

export const AIOptimizeIconButton: React.FC<AIOptimizeIconButtonProps> = ({
  content,
  title = "",
  onOptimize,
  disabled = false,
  className = "",
  onOpenSettings,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<AIOptimizeResponse | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastOptimizeSession, setLastOptimizeSession] = useState<{
    content: string;
    title: string;
    result: AIOptimizeResponse | null;
    streamingContent: string;
    wasInterrupted: boolean;
  } | null>(null);

  const { showError, AlertComponent } = useSidebarAlert();

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

  // 处理AI优化
  const handleOptimize = async (event?: React.MouseEvent) => {
    // 防止事件冒泡
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      console.log('🖱️ 按钮点击事件触发', { 
        type: event.type, 
        target: event.target, 
        currentTarget: event.currentTarget 
      });
    }

    console.log('🚀 AI优化按钮被点击', {
      content: content.substring(0, 50) + '...',
      title,
      hasContent,
      isConfigured,
      isOptimizing,
      showDialog,
      disabled,
      timestamp: new Date().toISOString()
    });

    // 如果按钮被禁用，不执行任何操作
    if (disabled) {
      console.log('🚫 按钮已禁用，跳过执行');
      return;
    }

    // 如果正在优化且对话框未显示，则显示对话框
    if (isOptimizing && !showDialog) {
      console.log('🔄 正在优化中，显示对话框');
      setShowDialog(true);
      return;
    }

    // 如果已经在优化中，不重复执行
    if (isOptimizing) {
      console.log('⏸️ 已在优化中，跳过');
      return;
    }

    // 检查AI服务配置
    const configCheck = aiService.isConfigured();
    console.log('🔍 AI配置检查结果:', configCheck);
    if (!configCheck) {
      console.log('⚠️ AI服务未配置，打开设置');
      if (onOpenSettings) {
        onOpenSettings();
      } else {
        console.warn('⚠️ onOpenSettings回调未定义');
      }
      return;
    }

    // 检查是否有上次中断的会话
    if (lastOptimizeSession && 
        lastOptimizeSession.content === content && 
        lastOptimizeSession.title === title &&
        lastOptimizeSession.wasInterrupted) {
      console.log('🔄 恢复上次中断的会话');
      setOptimizeResult(lastOptimizeSession.result);
      setStreamingContent(lastOptimizeSession.streamingContent);
      setShowDialog(true);
      return;
    }

    console.log('✨ 开始新的AI优化流程');
    setIsOptimizing(true);
    setShowDialog(true);
    setOptimizeResult(null);
    setStreamingContent('');
    setIsStreaming(false);

    try {
      const cfg = aiService.getConfig();
      console.log('📤 发送AI优化请求', { provider: cfg?.provider, hasApiKey: !!cfg?.apiKey });

      if (cfg?.provider === 'gemini') {
        console.log('🤖 使用Gemini非流式模式');
        // Gemini 使用非流式模式
        const result = await aiService.optimizePrompt({
          content,
          title,
          mode: hasContent ? 'optimize' : 'generate'
        });
        setOptimizeResult(result);
      } else {
        console.log('🌊 使用流式模式');
        // 其他提供商使用流式模式
        setIsStreaming(true);
        const streamCallback: StreamCallback = {
          onChunk: (chunk: string) => {
            setStreamingContent(prev => prev + chunk);
          },
          onComplete: (fullResponse: string) => {
            console.log('🎉 流式响应完成');
            setIsStreaming(false);
          },
          onError: (error: Error) => {
            console.error('❌ 流式响应错误:', error);
            setIsStreaming(false);
          }
        };

        const result = await aiService.optimizePrompt({
          content,
          title,
          mode: hasContent ? 'optimize' : 'generate'
        }, streamCallback);

        setIsStreaming(false);
        setOptimizeResult(result);
      }

      console.log('✅ AI优化完成');
    } catch (error) {
      console.error('❌ AI优化失败:', error);
      
      // 保存失败的会话状态
      setLastOptimizeSession({
        content,
        title,
        result: null,
        streamingContent,
        wasInterrupted: true
      });

      // 显示错误信息
      showError('AI优化失败', error instanceof Error ? error.message : '未知错误');
      setShowDialog(false);
    } finally {
      console.log('🏁 AI优化流程结束');
      setIsOptimizing(false);
    }
  };

  // 接受优化结果
  const handleAcceptResult = (optimizedContent: string) => {
    onOptimize(optimizedContent);
    setShowDialog(false);
    setOptimizeResult(null);
    setStreamingContent('');
    setLastOptimizeSession(null); // 清除会话状态
  };

  // 拒绝优化结果
  const handleRejectResult = () => {
    setShowDialog(false);
    // 保持会话状态，以便用户重新打开查看
    if (lastOptimizeSession) {
      setLastOptimizeSession({
        ...lastOptimizeSession,
        wasInterrupted: true
      });
    }
  };

  // 处理对话框关闭（用户点击X或ESC）
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // 如果有结果或流式内容，保存为中断状态
      if (optimizeResult || streamingContent.trim().length > 0) {
        const sessionResult = optimizeResult || {
          optimizedContent: streamingContent,
          explanation: '',
          suggestions: []
        };
        setLastOptimizeSession({
          content,
          title,
          result: sessionResult,
          streamingContent,
          wasInterrupted: true
        });
      }
    }
    setShowDialog(open);
  };

  const tooltipText = hasContent 
    ? "使用AI优化当前提示词" 
    : "使用AI生成新的提示词";

  // 如果未配置AI服务，显示配置按钮
  if (!isConfigured) {
    return (
      <>
        <Button
          onClick={onOpenSettings}
          disabled={disabled}
          size="sm"
          variant="ghost"
          className={`w-8 h-8 p-0 rounded-full hover:bg-gray-100 ${className}`}
          title="点击配置AI服务以启用优化功能"
        >
          <Settings className="h-4 w-4 text-gray-500" />
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleOptimize}
        disabled={disabled}
        size="sm"
        variant="ghost"
        className={`w-8 h-8 p-0 rounded-full hover:bg-gray-100 ${className}`}
        title={isOptimizing && !showDialog ? "点击查看AI优化进度" : tooltipText}
      >
        {isOptimizing ? (
          <div className="relative">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <div className="absolute inset-0 animate-pulse bg-blue-500/20 rounded-full" />
          </div>
        ) : (
          <Sparkles className="h-4 w-4 text-blue-500 animate-breathing" />
        )}
      </Button>

      {/* AI优化结果对话框 */}
      <AIOptimizeDialog
        open={showDialog}
        onOpenChange={handleDialogClose}
        result={optimizeResult}
        onAccept={handleAcceptResult}
        onReject={handleRejectResult}
        onRegenerate={handleOptimize}
        isLoading={isOptimizing}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
        wasInterrupted={lastOptimizeSession?.wasInterrupted || false}
      />

      {/* 自定义侧边栏警告对话框 */}
      <AlertComponent />
    </>
  );
};
