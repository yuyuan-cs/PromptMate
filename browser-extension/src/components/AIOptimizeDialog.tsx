import React, { useState } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Copy, Check, X, Sparkles } from 'lucide-react';
import { AIOptimizeResponse } from '../services/aiService';

interface AIOptimizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: AIOptimizeResponse | null;
  onAccept: (optimizedContent: string) => void;
  onReject: () => void;
  isLoading?: boolean;
  streamingContent?: string;
  isStreaming?: boolean;
}

export const AIOptimizeDialog: React.FC<AIOptimizeDialogProps> = ({
  open,
  onOpenChange,
  result,
  onAccept,
  onReject,
  isLoading = false,
  streamingContent = '',
  isStreaming = false,
}) => {
  const [copied, setCopied] = useState(false);

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  if (!open) return null;

  const displayContent = isStreaming ? streamingContent : result?.optimizedContent || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold">AI 优化结果</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 overflow-hidden">
          {/* Loading State */}
          {(isLoading || isStreaming) && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-500" />
                <p className="text-sm text-gray-600">
                  {isStreaming ? 'AI 正在优化中...' : '正在处理...'}
                </p>
              </div>
            </div>
          )}

          {/* Streaming Content */}
          {isStreaming && streamingContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">实时优化结果</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(streamingContent)}
                  className="h-7"
                >
                  {copied ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copied ? '已复制' : '复制'}
                </Button>
              </div>
              <ScrollArea className="h-64 w-full border rounded-md p-3">
                <div className="whitespace-pre-wrap text-sm font-mono">
                  {streamingContent}
                  <span className="animate-pulse">|</span>
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Final Result */}
          {result && !isStreaming && (
            <div className="space-y-4">
              {/* Optimized Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">优化后的提示词</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.optimizedContent)}
                    className="h-7"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copied ? '已复制' : '复制'}
                  </Button>
                </div>
                <ScrollArea className="h-48 w-full border rounded-md p-3">
                  <div className="whitespace-pre-wrap text-sm">
                    {result.optimizedContent}
                  </div>
                </ScrollArea>
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">优化说明</h3>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-blue-900">
                      {result.explanation}
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">建议</h3>
                  <div className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {result && !isStreaming && (
          <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={onReject}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              onClick={() => onAccept(result.optimizedContent)}
              disabled={isLoading || !result.optimizedContent}
              className="bg-purple-500 hover:bg-purple-600"
            >
              应用优化
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
