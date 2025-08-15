import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GitCompare, 
  Play, 
  Clock, 
  Star,
  Loader2,
  Save,
  Eye,
  MessageSquare,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Prompt, PromptComparison, ComparisonResult } from '@/types';
import { AI_MODELS } from '@/services/aiService';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PromptComparisonManagerProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onRunComparison: (selectedModels: string[], testInput?: string) => Promise<ComparisonResult[]>;
  onSaveComparison: (comparison: Omit<PromptComparison, 'id' | 'createdAt'>) => void;
  existingComparisons?: PromptComparison[];
}

export const PromptComparisonManager: React.FC<PromptComparisonManagerProps> = ({
  isOpen,
  onClose,
  prompt,
  onRunComparison,
  onSaveComparison,
  existingComparisons = [],
}) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [testInput, setTestInput] = useState('');
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [comparisonNotes, setComparisonNotes] = useState('');
  const [selectedComparison, setSelectedComparison] = useState<PromptComparison | null>(null);

  if (!prompt) return null;

  // 获取所有可用的模型
  const availableModels = Object.entries(AI_MODELS).flatMap(([provider, models]) =>
    models.map(model => ({
      id: `${provider}:${model.id}`,
      name: `${provider} - ${model.name}`,
      provider,
      model: model.id
    }))
  );

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleRunComparison = async () => {
    if (selectedModels.length === 0) return;

    setIsRunning(true);
    try {
      const results = await onRunComparison(selectedModels, testInput || undefined);
      setComparisonResults(results);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveComparison = () => {
    if (comparisonResults.length === 0) return;

    const comparison: Omit<PromptComparison, 'id' | 'createdAt'> = {
      promptId: prompt.id,
      promptTitle: prompt.title,
      promptVersion: prompt.version,
      results: comparisonResults,
      notes: comparisonNotes.trim() || undefined,
    };

    onSaveComparison(comparison);
    setComparisonResults([]);
    setComparisonNotes('');
    setSelectedModels([]);
    setTestInput('');
  };

  const handleRateResult = (resultId: string, rating: number) => {
    setComparisonResults(prev =>
      prev.map(result =>
        result.id === resultId ? { ...result, rating } : result
      )
    );
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return 'text-gray-400';
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            <DialogTitle>提示词对比 - {prompt.title}</DialogTitle>
          </div>
          <DialogDescription>
            在多个AI模型下测试提示词效果，并保存对比记录
          </DialogDescription>
        </DialogHeader>

        {/* 标签页 */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('new')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'new'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            新建对比
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'history'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            历史记录 ({existingComparisons.length})
          </button>
        </div>

        <div className="flex-1 min-h-0">
          {activeTab === 'new' ? (
            <div className="flex gap-4 h-full">
              {/* 左侧：配置区域 */}
              <div className="w-1/3 space-y-4 py-4">
                <div>
                  <Label className="text-base font-medium">选择模型</Label>
                  <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
                    {availableModels.map((model) => (
                      <div key={model.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={model.id}
                          checked={selectedModels.includes(model.id)}
                          onCheckedChange={() => handleModelToggle(model.id)}
                        />
                        <Label htmlFor={model.id} className="text-sm">
                          {model.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="test-input" className="text-base font-medium">
                    测试输入（可选）
                  </Label>
                  <Textarea
                    id="test-input"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="输入测试内容，如果为空则使用提示词本身..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleRunComparison}
                  disabled={selectedModels.length === 0 || isRunning}
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      运行中...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      开始对比 ({selectedModels.length} 个模型)
                    </>
                  )}
                </Button>

                {comparisonResults.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="comparison-notes" className="text-base font-medium">
                      对比备注
                    </Label>
                    <Textarea
                      id="comparison-notes"
                      value={comparisonNotes}
                      onChange={(e) => setComparisonNotes(e.target.value)}
                      placeholder="记录这次对比的目的、发现等..."
                      className="min-h-[80px]"
                    />
                    <Button onClick={handleSaveComparison} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      保存对比记录
                    </Button>
                  </div>
                )}
              </div>

              {/* 右侧：结果区域 */}
              <div className="flex-1 py-4">
                {comparisonResults.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <GitCompare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>选择模型并运行对比查看结果</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {comparisonResults.map((result) => (
                        <div key={result.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {result.modelProvider}
                              </Badge>
                              <span className="font-medium">{result.modelName}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {result.responseTime}ms
                              </div>
                              
                              {/* 评分 */}
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => handleRateResult(result.id, star)}
                                    className="p-0.5"
                                  >
                                    <Star
                                      className={cn(
                                        "h-4 w-4 transition-colors",
                                        star <= (result.rating || 0)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300 hover:text-yellow-300"
                                      )}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-muted/50 rounded p-3 text-sm whitespace-pre-wrap">
                            {result.response}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          ) : (
            // 历史记录标签页
            <div className="flex gap-4 h-full py-4">
              <div className="w-1/3 border-r pr-4">
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {existingComparisons.map((comparison) => (
                      <div
                        key={comparison.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedComparison?.id === comparison.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setSelectedComparison(comparison)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="secondary">
                            v{comparison.promptVersion}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {comparison.results.length} 个模型
                          </span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-1">
                          {formatDistanceToNow(new Date(comparison.createdAt), {
                            addSuffix: true,
                            locale: zhCN
                          })}
                        </div>
                        
                        {comparison.notes && (
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {comparison.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex-1">
                {selectedComparison ? (
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      <div className="border-b pb-3">
                        <h3 className="font-medium">
                          对比记录 - {selectedComparison.promptTitle} v{selectedComparison.promptVersion}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(selectedComparison.createdAt), {
                            addSuffix: true,
                            locale: zhCN
                          })}
                        </div>
                        {selectedComparison.notes && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                            {selectedComparison.notes}
                          </div>
                        )}
                      </div>

                      {selectedComparison.results.map((result) => (
                        <div key={result.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {result.modelProvider}
                              </Badge>
                              <span className="font-medium">{result.modelName}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {result.responseTime}ms
                              </div>
                              
                              {result.rating && (
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={cn(
                                        "h-4 w-4",
                                        star <= result.rating!
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      )}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-muted/50 rounded p-3 text-sm whitespace-pre-wrap">
                            {result.response}
                          </div>
                          
                          {result.notes && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              备注: {result.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>选择一个对比记录查看详情</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
