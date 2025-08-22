// AI模型定义接口
export interface AIModel {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  category?: 'chat' | 'embedding' | 'vision' | 'code';
}

// AI服务配置接口
export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'custom';
}

// AI优化请求接口
export interface AIOptimizeRequest {
  content: string;
  title?: string;
  mode: 'optimize' | 'generate';
}

// AI优化响应接口
export interface AIOptimizeResponse {
  optimizedContent: string;
  explanation?: string;
  suggestions?: string[];
}

// 流式响应回调接口
export interface StreamCallback {
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

// 各服务商支持的模型列表
export const AI_MODELS: Record<string, AIModel[]> = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: '最新多模态模型，支持文本、图像、音频', contextLength: 128000 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '轻量版GPT-4o，速度更快成本更低', contextLength: 128000 },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '高性能GPT-4模型', contextLength: 128000 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '性价比优选模型', contextLength: 16385 }
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: '最新Claude模型，推理能力强', contextLength: 200000 },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: '最强推理能力', contextLength: 200000 },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: '平衡性能与成本', contextLength: 200000 }
  ],
  gemini: [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: '最新Gemini模型，支持长上下文', contextLength: 2000000 },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: '快速版本，适合实时应用', contextLength: 1000000 },
    { id: 'gemini-pro', name: 'Gemini Pro', description: '经典Gemini模型', contextLength: 32768 }
  ],
  custom: [
    { id: 'custom-model', name: '自定义模型', description: '请配置您的自定义模型', contextLength: 4096 }
  ]
};

// 获取指定服务商的模型列表
export function getModelsForProvider(provider: string): AIModel[] {
  return AI_MODELS[provider] || [];
}

// 精简的提示词优化模板
const PROMPT_OPTIMIZATION_TEMPLATE = `作为提示词专家，优化以下内容：

标题：{title}
内容：{content}

要求：
1. 优化提示词结构和清晰度
2. 确保包含角色、任务、格式要求
3. 提供简要优化说明

格式：
## 优化后的提示词
[优化内容]

## 优化说明
[关键改进点]

## 建议
[1-2条实用建议]`;

// AI服务类
export class AIService {
  private config: AIConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  // 加载配置
  private loadConfig() {
    try {
      const savedConfig = localStorage.getItem('ai-config');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error('加载AI配置失败:', error);
    }
  }

  // 保存配置
  public saveConfig(config: AIConfig) {
    this.config = config;
    localStorage.setItem('ai-config', JSON.stringify(config));
  }

  // 获取配置
  public getConfig(): AIConfig | null {
    return this.config;
  }

  // 检查是否已配置
  public isConfigured(): boolean {
    return this.config !== null && this.config.apiKey.trim() !== '';
  }

  // 测试连接
  public async testConnection(config: AIConfig): Promise<boolean> {
    const { apiKey, baseUrl, model, provider } = config;

    // 构建测试请求
    let requestBody: any;
    let headers: Record<string, string>;

    switch (provider) {
      case 'openai':
        requestBody = {
          model: model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
          max_tokens: 10
        };
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        break;

      case 'anthropic':
        requestBody = {
          model: model || 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }]
        };
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        };
        break;

      case 'gemini':
        requestBody = {
          contents: [{ role: 'user', parts: [{ text: 'Hello, this is a test message.' }] }],
          generationConfig: { maxOutputTokens: 10 }
        };
        headers = { 'Content-Type': 'application/json' };
        break;

      case 'custom':
      default:
        requestBody = {
          model: model,
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
          max_tokens: 10
        };
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        break;
    }

    try {
      const requestUrl = this.buildRequestUrl(provider, baseUrl, model, apiKey);
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      // 检查响应是否包含预期的内容
      let hasValidResponse = false;
      switch (provider) {
        case 'openai':
        case 'custom':
          hasValidResponse = !!(data.choices?.[0]?.message?.content);
          break;
        case 'anthropic':
          hasValidResponse = !!(data.content?.[0]?.text);
          break;
        case 'gemini':
          hasValidResponse = !!(data?.candidates?.[0]?.content?.parts?.[0]?.text);
          break;
        default:
          hasValidResponse = !!(data.choices?.[0]?.message?.content);
          break;
      }

      return hasValidResponse;
    } catch (error) {
      console.error('连接测试失败:', error);
      return false;
    }
  }

  // 优化提示词（支持流式输出）
  public async optimizePrompt(
    request: AIOptimizeRequest, 
    streamCallback?: StreamCallback
  ): Promise<AIOptimizeResponse> {
    if (!this.isConfigured()) {
      throw new Error('AI服务未配置，请先配置API密钥');
    }

    const { content, title = '', mode } = request;

    // 构建精简提示词
    const prompt = PROMPT_OPTIMIZATION_TEMPLATE
      .replace('{title}', title)
      .replace('{content}', content || '请生成一个高质量的提示词');

    try {
      const response = streamCallback 
        ? await this.callAIStream(prompt, streamCallback)
        : await this.callAI(prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('AI优化失败:', error);
      throw new Error('AI服务调用失败，请检查网络连接和API配置');
    }
  }

  // 调用AI服务（流式）
  private async callAIStream(prompt: string, callback: StreamCallback): Promise<string> {
    if (!this.config) {
      throw new Error('AI配置未找到');
    }

    let fullResponse = '';

    try {
      const { requestBody, headers, requestUrl } = this.buildRequest(prompt, true);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API调用失败: ${response.status} ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取流式响应');
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = this.extractStreamContent(parsed, this.config.provider);
              if (content) {
                fullResponse += content;
                callback.onChunk(content);
              }
            } catch (e) {
              // 忽略解析错误的行
            }
          }
        }
      }

      callback.onComplete(fullResponse);
      return fullResponse;
    } catch (error) {
      callback.onError(error as Error);
      throw error;
    }
  }

  // 提取流式内容
  private extractStreamContent(data: any, provider: string): string {
    switch (provider) {
      case 'openai':
      case 'custom':
        return data.choices?.[0]?.delta?.content || '';
      case 'anthropic':
        return data.delta?.text || '';
      case 'gemini':
        return data?.candidates?.[0]?.delta?.parts?.[0]?.text || '';
      default:
        return data.choices?.[0]?.delta?.content || '';
    }
  }

  // 构建请求参数
  private buildRequest(prompt: string, stream: boolean = false) {
    if (!this.config) {
      throw new Error('AI配置未找到');
    }

    const { apiKey, baseUrl, model, provider } = this.config;
    let requestBody: any;
    let headers: Record<string, string>;

    switch (provider) {
      case 'openai':
        requestBody = {
          model: model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1500,
          stream
        };
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        break;

      case 'anthropic':
        requestBody = {
          model: model || 'claude-3-sonnet-20240229',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
          stream
        };
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        };
        break;

      case 'gemini':
        requestBody = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1500,
            temperature: 0.7
          }
        };
        headers = { 'Content-Type': 'application/json' };
        break;

      case 'custom':
      default:
        requestBody = {
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1500,
          stream
        };
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        break;
    }

    const requestUrl = this.buildRequestUrl(provider, baseUrl, model, apiKey);
    return { requestBody, headers, requestUrl };
  }

  // 构建请求URL
  private buildRequestUrl(provider: string, baseUrl: string, model: string, apiKey: string): string {
    switch (provider) {
      case 'gemini':
        if (baseUrl === 'https://generativelanguage.googleapis.com' || 
            baseUrl === 'https://generativelanguage.googleapis.com/') {
          return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        }
        return baseUrl;
        
      case 'openai':
        if (baseUrl === 'https://api.openai.com' || baseUrl === 'https://api.openai.com/') {
          return 'https://api.openai.com/v1/chat/completions';
        }
        if (!baseUrl.includes('/chat/completions')) {
          return baseUrl.replace(/\/$/, '') + '/v1/chat/completions';
        }
        return baseUrl;
        
      case 'anthropic':
        if (baseUrl === 'https://api.anthropic.com' || baseUrl === 'https://api.anthropic.com/') {
          return 'https://api.anthropic.com/v1/messages';
        }
        if (!baseUrl.includes('/messages')) {
          return baseUrl.replace(/\/$/, '') + '/v1/messages';
        }
        return baseUrl;
        
      case 'custom':
      default:
        if (!baseUrl.includes('/chat/completions') && !baseUrl.includes('/v1/')) {
          return baseUrl.replace(/\/$/, '') + '/v1/chat/completions';
        }
        return baseUrl;
    }
  }

  // 调用AI服务（非流式）
  private async callAI(prompt: string): Promise<string> {
    if (!this.config) {
      throw new Error('AI配置未找到');
    }

    const { requestBody, headers, requestUrl } = this.buildRequest(prompt, false);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API调用失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // 根据不同提供商解析响应
    switch (this.config.provider) {
      case 'openai':
      case 'custom':
        return data.choices?.[0]?.message?.content || '';
      case 'anthropic':
        return data.content?.[0]?.text || '';
      case 'gemini':
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      default:
        return data.choices?.[0]?.message?.content || '';
    }
  }

  // 解析AI响应
  public parseResponse(response: string): AIOptimizeResponse {
    try {
      // 尝试解析结构化响应
      const sections = response.split('##');
      
      let optimizedContent = '';
      let explanation = '';
      let suggestions: string[] = [];

      sections.forEach(section => {
        const trimmed = section.trim();
        if (trimmed.startsWith('优化后的提示词')) {
          optimizedContent = trimmed.replace('优化后的提示词', '').trim();
        } else if (trimmed.startsWith('优化说明')) {
          explanation = trimmed.replace('优化说明', '').trim();
        } else if (trimmed.startsWith('建议')) {
          const suggestionText = trimmed.replace('建议', '').trim();
          suggestions = suggestionText.split('\n').filter(s => s.trim());
        }
      });

      // 如果没有找到结构化内容，使用整个响应作为优化内容
      if (!optimizedContent) {
        optimizedContent = response;
      }

      return {
        optimizedContent,
        explanation,
        suggestions
      };
    } catch (error) {
      console.error('解析AI响应失败:', error);
      return {
        optimizedContent: response,
        explanation: '解析响应时出现问题，但已获得优化结果',
        suggestions: []
      };
    }
  }
}

// 全局AI服务实例
export const aiService = new AIService();
