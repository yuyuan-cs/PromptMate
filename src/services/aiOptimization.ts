import { useToast } from "@/hooks/use-toast";

export interface OptimizedContent {
  title: string;
  content: string;
  originalTitle?: string;
  originalContent?: string;
}

export interface AIOptimizationOptions {
  includeTitle?: boolean;
  optimizationType?: 'clarity' | 'conciseness' | 'effectiveness' | 'structure';
  targetLength?: 'shorter' | 'longer' | 'maintain';
  context?: string; // 额外的上下文信息
}

/**
 * AI内容优化服务
 * 提供统一的AI优化功能，包括内容解析、优化请求等
 */
export class AIOptimizationService {
  private static instance: AIOptimizationService;
  
  public static getInstance(): AIOptimizationService {
    if (!AIOptimizationService.instance) {
      AIOptimizationService.instance = new AIOptimizationService();
    }
    return AIOptimizationService.instance;
  }

  /**
   * 解析AI返回的优化内容
   * 尝试分离标题和内容
   */
  public parseOptimizedContent(
    optimizedText: string, 
    originalTitle?: string
  ): OptimizedContent {
    const lines = optimizedText.split('\n').map(line => line.trim()).filter(Boolean);
    
    let title = originalTitle || "";
    let content = optimizedText;

    // 情况1: 检查是否有明确的标题标记
    const titleMarkers = ['# ', '## ', '标题:', '标题：', 'Title:', 'Title：'];
    const firstLine = lines[0];
    
    if (firstLine && titleMarkers.some(marker => firstLine.startsWith(marker))) {
      // 提取标记后的标题
      const marker = titleMarkers.find(m => firstLine.startsWith(m));
      if (marker) {
        title = firstLine.substring(marker.length).trim();
        content = lines.slice(1).join('\n').trim();
      }
    }
    // 情况2: 检查第一行是否像标题（短且不包含特殊字符）
    else if (lines.length > 1 && firstLine.length < 100 && this.looksLikeTitle(firstLine)) {
      title = firstLine;
      content = lines.slice(1).join('\n').trim();
    }
    // 情况3: 检查是否有"内容:"或"Content:"分隔符
    else {
      const contentMarkers = ['内容:', '内容：', 'Content:', 'Content：', '正文:', '正文：'];
      const contentMarkerIndex = lines.findIndex(line => 
        contentMarkers.some(marker => line.startsWith(marker))
      );
      
      if (contentMarkerIndex > 0) {
        // 前面的部分作为标题
        title = lines.slice(0, contentMarkerIndex).join(' ').trim();
        // 内容标记后的部分作为内容
        const contentMarker = contentMarkers.find(marker => 
          lines[contentMarkerIndex].startsWith(marker)
        );
        if (contentMarker) {
          const contentFromMarker = lines[contentMarkerIndex].substring(contentMarker.length).trim();
          const restContent = lines.slice(contentMarkerIndex + 1).join('\n').trim();
          content = contentFromMarker + (restContent ? '\n' + restContent : '');
        }
      }
    }

    // 清理内容
    content = this.cleanContent(content);
    title = this.cleanTitle(title);

    return {
      title: title || originalTitle || "",
      content: content || optimizedText,
      originalTitle,
      originalContent: optimizedText,
    };
  }

  /**
   * 判断文本是否像标题
   */
  private looksLikeTitle(text: string): boolean {
    // 标题的特征：
    // 1. 长度适中（通常小于100字符）
    // 2. 不包含换行符
    // 3. 不以标点符号开头
    // 4. 不包含太多标点符号
    // 5. 不以问号结尾（除非是疑问式标题）
    
    if (text.length > 100 || text.includes('\n')) {
      return false;
    }
    
    // 不以标点符号开头
    if (/^[，。！？；：、,.!?;:]/.test(text)) {
      return false;
    }
    
    // 不包含过多的句号和感叹号
    const punctuationCount = (text.match(/[。！.!]/g) || []).length;
    if (punctuationCount > 2) {
      return false;
    }
    
    // 不以句号或感叹号结尾（问号可以）
    if (/[。！.!]$/.test(text)) {
      return false;
    }
    
    return true;
  }

  /**
   * 清理标题文本
   */
  private cleanTitle(title: string): string {
    return title
      .replace(/^["'"'】】}\]]+|["'"'【【{[]+$/g, '') // 移除首尾引号和括号
      .replace(/^[：:]\s*/, '') // 移除开头的冒号
      .replace(/\s*[：:]\s*$/, '') // 移除结尾的冒号
      .trim();
  }

  /**
   * 清理内容文本
   */
  private cleanContent(content: string): string {
    return content
      .replace(/^["'"'】】}\]]+|["'"'【【{[]+$/g, '') // 移除首尾引号和括号
      .replace(/^\s*[：:]\s*/, '') // 移除开头的冒号
      .trim();
  }

  /**
   * 生成优化提示
   */
  public generateOptimizationPrompt(
    originalContent: string,
    originalTitle?: string,
    options: AIOptimizationOptions = {}
  ): string {
    const {
      includeTitle = true,
      optimizationType = 'effectiveness',
      targetLength = 'maintain',
      context = ''
    } = options;

    let prompt = '';

    // 基础指令
    switch (optimizationType) {
      case 'clarity':
        prompt = '请帮我优化这个提示词，使其更加清晰易懂：\n\n';
        break;
      case 'conciseness':
        prompt = '请帮我优化这个提示词，使其更加简洁明了：\n\n';
        break;
      case 'effectiveness':
        prompt = '请帮我优化这个提示词，使其更加有效和实用：\n\n';
        break;
      case 'structure':
        prompt = '请帮我优化这个提示词的结构和组织：\n\n';
        break;
    }

    // 添加原始内容
    if (originalTitle && includeTitle) {
      prompt += `标题: ${originalTitle}\n\n`;
    }
    prompt += `内容: ${originalContent}\n\n`;

    // 添加上下文
    if (context) {
      prompt += `上下文: ${context}\n\n`;
    }

    // 添加长度要求
    switch (targetLength) {
      case 'shorter':
        prompt += '请在保持核心信息的前提下，使内容更加简洁。\n';
        break;
      case 'longer':
        prompt += '请在原有基础上，增加更多细节和说明。\n';
        break;
      case 'maintain':
        prompt += '请保持大致相同的长度。\n';
        break;
    }

    // 添加格式要求
    if (includeTitle) {
      prompt += '\n请按以下格式返回：\n';
      prompt += '标题: [优化后的标题]\n';
      prompt += '内容: [优化后的内容]';
    } else {
      prompt += '\n请直接返回优化后的内容。';
    }

    return prompt;
  }

  /**
   * 验证优化结果
   */
  public validateOptimizedContent(
    optimizedContent: OptimizedContent,
    originalContent: string
  ): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // 检查内容长度
    if (optimizedContent.content.length < originalContent.length * 0.3) {
      warnings.push('优化后的内容可能过短，可能丢失了重要信息');
    }

    if (optimizedContent.content.length > originalContent.length * 3) {
      warnings.push('优化后的内容可能过长，可能偏离了原意');
    }

    // 检查标题
    if (optimizedContent.title && optimizedContent.title.length > 200) {
      warnings.push('标题可能过长');
    }

    // 检查是否包含基本内容
    if (!optimizedContent.content.trim()) {
      warnings.push('优化后的内容为空');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
}

/**
 * Hook版本的AI优化服务
 * 提供React组件中使用的便捷接口
 */
export const useAIOptimization = () => {
  const { toast } = useToast();
  const aiService = AIOptimizationService.getInstance();

  const optimizeContent = async (
    content: string,
    title?: string,
    options?: AIOptimizationOptions
  ): Promise<OptimizedContent | null> => {
    try {
      // 这里应该调用实际的AI API
      // 目前返回模拟的优化结果
      const optimizationPrompt = aiService.generateOptimizationPrompt(content, title, options);
      
      // TODO: 实际的AI API调用
      // const response = await callAIAPI(optimizationPrompt);
      
      // 模拟AI响应
      const simulatedResponse = `优化标题\n\n这是优化后的内容：${content}的优化版本`;
      
      const optimizedContent = aiService.parseOptimizedContent(simulatedResponse, title);
      const validation = aiService.validateOptimizedContent(optimizedContent, content);
      
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          toast({
            title: "优化提醒",
            description: warning,
            variant: "default",
          });
        });
      }
      
      return optimizedContent;
    } catch (error) {
      console.error('AI优化失败:', error);
      toast({
        title: "优化失败",
        description: "AI优化服务暂时不可用，请稍后重试",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    optimizeContent,
    parseOptimizedContent: aiService.parseOptimizedContent.bind(aiService),
    generateOptimizationPrompt: aiService.generateOptimizationPrompt.bind(aiService),
    validateOptimizedContent: aiService.validateOptimizedContent.bind(aiService),
  };
};
