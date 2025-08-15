import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, X, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import { AIOptimizeResponse } from "@/services/aiService";

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
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "复制成功",
        description: "优化后的内容已复制到剪贴板",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      });
    }
  };

  // 接受优化结果
  const handleAccept = () => {
    if (result?.optimizedContent) {
      onAccept(result.optimizedContent);
      onOpenChange(false);
    }
  };

  // 拒绝优化结果
  const handleReject = () => {
    onReject();
    onOpenChange(false);
  };

  // 流式显示或加载状态
  if (isLoading || isStreaming) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0">
          <div className="flex-shrink-0 p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-pulse text-purple-500" />
                {isStreaming ? 'AI正在生成内容...' : 'AI正在优化您的提示词...'}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          {isStreaming && streamingContent ? (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-4">
                <Badge variant="secondary" className="animate-pulse">
                  实时生成中...
                </Badge>
              </div>
              <div className="border rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{streamingContent}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-muted-foreground">
                  AI正在分析并优化您的提示词，请稍候...
                </p>
              </div>
            </div>
          )}
          
          <div className="flex-shrink-0 h-6"></div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!result && !streamingContent) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0">
        <div className="flex-shrink-0 p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI优化结果
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
              {/* 优化后的提示词 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">优化后的提示词</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.optimizedContent)}
                    className="gap-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "已复制" : "复制"}
                  </Button>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{result.optimizedContent}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* 优化说明 */}
              {result.explanation && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">优化说明</h3>
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="prose prose-sm max-w-none text-blue-900 dark:text-blue-100">
                        <ReactMarkdown>{result.explanation}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 建议 */}
              {result.suggestions && result.suggestions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">进一步建议</h3>
                    <div className="space-y-2">
                      {result.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800"
                        >
                          <Badge variant="secondary" className="mt-0.5 text-xs">
                            {index + 1}
                          </Badge>
                          <div className="text-sm text-green-900 dark:text-green-100 flex-1">
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{suggestion}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>

        <div className="flex-shrink-0 p-6 pt-0">
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleReject}>
              拒绝
            </Button>
            <Button onClick={handleAccept}>
              接受
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
