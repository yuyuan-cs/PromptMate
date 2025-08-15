import { useState, useCallback } from 'react';
import { Prompt, PromptVersion, PromptComparison, ComparisonResult } from '@/types';
import { generateId } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';

const STORAGE_KEYS = {
  COMPARISONS: 'promptmate_comparisons',
};

// 本地存储操作
const saveComparisons = (comparisons: PromptComparison[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify(comparisons));
  } catch (error) {
    console.error('保存对比记录失败:', error);
  }
};

const loadComparisons = (): PromptComparison[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPARISONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('加载对比记录失败:', error);
    return [];
  }
};

export const usePromptEnhancements = () => {
  const { toast } = useToast();
  const [comparisons, setComparisons] = useState<PromptComparison[]>(loadComparisons());

  // 版本管理功能
  const createPromptVersion = useCallback((prompt: Prompt, changeNotes?: string): PromptVersion => {
    const newVersion: PromptVersion = {
      id: generateId(),
      version: prompt.version,
      title: prompt.title,
      content: prompt.content,
      description: prompt.description,
      images: prompt.images,
      createdAt: prompt.updatedAt,
      changeNotes,
    };

    return newVersion;
  }, []);

  const restorePromptVersion = useCallback((prompt: Prompt, version: PromptVersion): Partial<Prompt> => {
    const newVersionNumber = Math.max(prompt.version, ...(prompt.versions?.map(v => v.version) || [])) + 1;
    
    return {
      title: version.title,
      content: version.content,
      description: version.description,
      images: version.images,
      version: newVersionNumber,
      updatedAt: new Date().toISOString(),
    };
  }, []);

  const addVersionToPrompt = useCallback((prompt: Prompt, changeNotes?: string): Partial<Prompt> => {
    const currentVersion = createPromptVersion(prompt, changeNotes);
    const versions = prompt.versions || [];
    
    return {
      version: prompt.version + 1,
      versions: [...versions, currentVersion],
      updatedAt: new Date().toISOString(),
    };
  }, [createPromptVersion]);

  // 评分功能
  const updatePromptRating = useCallback((rating: number, notes?: string): Partial<Prompt> => {
    return {
      rating,
      ratingNotes: notes,
      updatedAt: new Date().toISOString(),
    };
  }, []);

  // 对比功能
  const runPromptComparison = useCallback(async (
    prompt: Prompt,
    selectedModels: string[],
    testInput?: string
  ): Promise<ComparisonResult[]> => {
    const results: ComparisonResult[] = [];
    const content = testInput || prompt.content;

    for (const modelId of selectedModels) {
      const [provider, model] = modelId.split(':');
      
      try {
        const startTime = Date.now();
        
        // 这里需要根据实际的AI服务调用方式来实现
        // 暂时使用模拟数据
        const response = await simulateAIResponse(content, provider, model);
        const responseTime = Date.now() - startTime;

        const result: ComparisonResult = {
          id: generateId(),
          modelProvider: provider,
          modelName: model,
          response,
          responseTime,
          createdAt: new Date().toISOString(),
        };

        results.push(result);
      } catch (error) {
        console.error(`模型 ${modelId} 调用失败:`, error);
        
        const result: ComparisonResult = {
          id: generateId(),
          modelProvider: provider,
          modelName: model,
          response: `调用失败: ${error instanceof Error ? error.message : '未知错误'}`,
          responseTime: 0,
          createdAt: new Date().toISOString(),
        };

        results.push(result);
      }
    }

    return results;
  }, []);

  // 模拟AI响应（实际使用时需要替换为真实的AI服务调用）
  const simulateAIResponse = async (content: string, provider: string, model: string): Promise<string> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    return `这是来自 ${provider} ${model} 的模拟响应。\n\n输入内容: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}\n\n模拟的AI响应内容会根据不同的模型产生不同的结果。`;
  };

  const savePromptComparison = useCallback((comparison: Omit<PromptComparison, 'id' | 'createdAt'>) => {
    const newComparison: PromptComparison = {
      ...comparison,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const updatedComparisons = [...comparisons, newComparison];
    setComparisons(updatedComparisons);
    saveComparisons(updatedComparisons);

    toast({
      title: "对比记录已保存",
      description: `已保存 ${comparison.results.length} 个模型的对比结果`,
      variant: "success",
    });

    return newComparison;
  }, [comparisons, toast]);

  const getPromptComparisons = useCallback((promptId: string): PromptComparison[] => {
    return comparisons.filter(comparison => comparison.promptId === promptId);
  }, [comparisons]);

  const deleteComparison = useCallback((comparisonId: string) => {
    const updatedComparisons = comparisons.filter(c => c.id !== comparisonId);
    setComparisons(updatedComparisons);
    saveComparisons(updatedComparisons);

    toast({
      title: "对比记录已删除",
      variant: "warning",
    });
  }, [comparisons, toast]);

  // 获取提示词的统计信息
  const getPromptStats = useCallback((prompt: Prompt) => {
    const promptComparisons = getPromptComparisons(prompt.id);
    const totalComparisons = promptComparisons.length;
    const totalVersions = (prompt.versions?.length || 0) + 1; // +1 for current version
    
    // 计算平均评分（从对比结果中）
    const allRatings = promptComparisons.flatMap(c => 
      c.results.filter(r => r.rating).map(r => r.rating!)
    );
    const averageComparisonRating = allRatings.length > 0 
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
      : undefined;

    return {
      totalVersions,
      totalComparisons,
      averageComparisonRating,
      hasRating: !!prompt.rating,
      lastComparisonDate: promptComparisons.length > 0 
        ? promptComparisons[promptComparisons.length - 1].createdAt 
        : undefined,
    };
  }, [getPromptComparisons]);

  return {
    // 版本管理
    createPromptVersion,
    restorePromptVersion,
    addVersionToPrompt,
    
    // 评分功能
    updatePromptRating,
    
    // 对比功能
    runPromptComparison,
    savePromptComparison,
    getPromptComparisons,
    deleteComparison,
    
    // 统计信息
    getPromptStats,
    
    // 数据
    comparisons,
  };
};
