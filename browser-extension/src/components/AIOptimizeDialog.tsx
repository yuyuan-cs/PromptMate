import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Copy, Check, X, Sparkles } from 'lucide-react';
import { AIOptimizeResponse } from '../services/aiService';
import { LoadingState } from './ui/loading-states';
import { useTranslation } from '../i18n';

interface AIOptimizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: AIOptimizeResponse | null;
  onAccept: (optimizedContent: string) => void;
  onReject: () => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
  streamingContent?: string;
  isStreaming?: boolean;
  wasInterrupted?: boolean;
}

export const AIOptimizeDialog: React.FC<AIOptimizeDialogProps> = ({
  open,
  onOpenChange,
  result,
  onAccept,
  onReject,
  onRegenerate,
  isLoading = false,
  streamingContent = '',
  isStreaming = false,
  wasInterrupted = false,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(t('ai_copyFailed'), error);
    }
  };

  if (!open) return null;

  const displayContent = isStreaming ? streamingContent : result?.optimizedContent || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="extension-dialog bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold">
              {wasInterrupted ? '上次AI优化结果' : t('ai_optimizeResult')}
            </h2>
            {wasInterrupted && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                已中断
              </span>
            )}
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
        <ScrollArea className="flex-1 p-4 apple-scrollbar">
          <div className="space-y-4">
          {/* Loading State */}
          {(isLoading || isStreaming) && (
            <LoadingState 
              text={isStreaming ? t('ai_optimizing') : t('ai_processing')} 
              size="md"
            />
          )}

          {/* Streaming Content */}
          {isStreaming && streamingContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">{t('ai_realtimeResult')}</h3>
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
                  {copied ? t('ai_copied') : t('ai_copy')}
                </Button>
              </div>
              <div className="max-h-64 w-full border rounded-md p-3 overflow-y-auto custom-scrollbar bg-gray-50">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingContent}
                  </ReactMarkdown>
                </div>
                <span className="animate-pulse text-gray-500">|</span>
              </div>
            </div>
          )}

          {/* Final Result */}
          {result && !isStreaming && (
            <div className="space-y-4">
              {/* Optimized Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">{t('ai_optimizedPrompt')}</h3>
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
                    {copied ? t('ai_copied') : t('ai_copy')}
                  </Button>
                </div>
                <div className="max-h-48 w-full border rounded-md p-3 overflow-y-auto custom-scrollbar bg-gray-50">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {result.optimizedContent}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">{t('ai_explanation')}</h3>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 max-h-32 overflow-y-auto custom-scrollbar">
                    <div className="prose prose-sm max-w-none text-blue-900">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {result.explanation}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">{t('ai_suggestions')}</h3>
                  <div className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="text-sm text-gray-600 flex-1">
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {suggestion}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {result && !isStreaming && (
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            {/* Left side - Regenerate button (only show if interrupted or has onRegenerate) */}
            <div>
              {wasInterrupted && onRegenerate && (
                <Button
                  variant="outline"
                  onClick={onRegenerate}
                  disabled={isLoading}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  🔄 重新生成
                </Button>
              )}
            </div>
            
            {/* Right side - Accept/Reject buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onReject}
                disabled={isLoading}
              >
                {wasInterrupted ? '关闭' : t('ai_cancel')}
              </Button>
              <Button
                onClick={() => onAccept(result.optimizedContent)}
                disabled={isLoading || !result.optimizedContent}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {t('ai_applyOptimization')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
