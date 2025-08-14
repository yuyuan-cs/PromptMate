import { useToast } from "@/hooks/use-toast";

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

    // 添加调试信息
    console.log('测试连接配置:', { apiKey: apiKey?.substring(0, 10) + '...', baseUrl, model, provider });

    // 构建测试请求
    let requestBody: any;
    let headers: Record<string, string>;

    switch (provider) {
      case 'openai':
        requestBody = {
          model: model || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test message.'
            }
          ],
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
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test message.'
            }
          ]
        };
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        };
        break;

      case 'gemini':
        requestBody = {
          contents: [
            {
              parts: [
                {
                  text: 'Hello, this is a test message.'
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 10
          }
        };
        headers = {
          'Content-Type': 'application/json'
        };
        break;

      case 'custom':
      default:
        requestBody = {
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test message.'
            }
          ],
          max_tokens: 10
        };
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        break;
    }

    try {
      // 构建请求URL
      let requestUrl = baseUrl;
      
      // 根据不同服务商构建正确的API端点
      console.log('URL构建前:', { provider, baseUrl });
      switch (provider) {
        case 'gemini':
          // 只处理真正的Gemini API
          if (baseUrl === 'https://generativelanguage.googleapis.com' || 
              baseUrl === 'https://generativelanguage.googleapis.com/') {
            requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
          } else if (baseUrl.includes('generativelanguage.googleapis.com') && !baseUrl.includes(':generateContent')) {
            // 如果是Gemini域名但URL不完整，补充路径
            const cleanUrl = baseUrl.replace(/\/$/, '');
            requestUrl = `${cleanUrl}/v1beta/models/${model}:generateContent`;
          }
          // 添加API密钥到URL参数
          const separator = requestUrl.includes('?') ? '&' : '?';
          requestUrl = `${requestUrl}${separator}key=${apiKey}`;
          break;
          
        case 'openai':
          // OpenAI API端点处理
          if (baseUrl === 'https://api.openai.com' || baseUrl === 'https://api.openai.com/') {
            requestUrl = 'https://api.openai.com/v1/chat/completions';
          } else if (!baseUrl.includes('/chat/completions') && !baseUrl.includes('/v1/')) {
            const cleanUrl = baseUrl.replace(/\/$/, '');
            requestUrl = `${cleanUrl}/v1/chat/completions`;
          }
          break;
          
        case 'anthropic':
          // Anthropic API端点处理
          if (baseUrl === 'https://api.anthropic.com' || baseUrl === 'https://api.anthropic.com/') {
            requestUrl = 'https://api.anthropic.com/v1/messages';
          } else if (!baseUrl.includes('/messages') && !baseUrl.includes('/v1/')) {
            const cleanUrl = baseUrl.replace(/\/$/, '');
            requestUrl = `${cleanUrl}/v1/messages`;
          }
          break;
          
        case 'custom':
        default:
          // 自定义服务商处理（如硅基流动）
          if (baseUrl === 'https://api.siliconflow.cn' || baseUrl === 'https://api.siliconflow.cn/') {
            requestUrl = 'https://api.siliconflow.cn/v1/chat/completions';
          } else if (!baseUrl.includes('/chat/completions') && !baseUrl.includes('/v1/') && baseUrl.includes('siliconflow')) {
            const cleanUrl = baseUrl.replace(/\/$/, '');
            requestUrl = `${cleanUrl}/v1/chat/completions`;
          }
          break;
      }

      console.log('URL构建后:', { requestUrl, requestBody });

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error('API密钥无效，请检查您的API密钥是否正确');
        } else if (response.status === 403) {
          throw new Error('API访问被拒绝，请检查您的API密钥权限');
        } else if (response.status === 429) {
          throw new Error('API请求频率过高，请稍后再试');
        } else if (response.status >= 500) {
          throw new Error('AI服务暂时不可用，请稍后再试');
        } else {
          throw new Error(`API调用失败: ${response.status} ${errorText}`);
        }
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
          hasValidResponse = !!(data.candidates?.[0]?.content?.parts?.[0]?.text);
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

    const { apiKey, baseUrl, model, provider } = this.config;
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
              const content = this.extractStreamContent(parsed, provider);
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
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
          contents: [{ parts: [{ text: prompt }] }],
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

    // 构建请求URL
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
        break;
        
      case 'openai':
        if (baseUrl === 'https://api.openai.com' || baseUrl === 'https://api.openai.com/') {
          return 'https://api.openai.com/v1/chat/completions';
        }
        break;
        
      case 'anthropic':
        if (baseUrl === 'https://api.anthropic.com' || baseUrl === 'https://api.anthropic.com/') {
          return 'https://api.anthropic.com/v1/messages';
        }
        break;
        
      case 'custom':
      default:
        if (baseUrl.includes('siliconflow')) {
          return baseUrl.replace(/\/$/, '') + '/v1/chat/completions';
        }
        break;
    }
    
    return baseUrl;
  }

  // 调用AI服务（非流式）
  private async callAI(prompt: string): Promise<string> {
    if (!this.config) {
      throw new Error('AI配置未找到');
    }

    const { apiKey, baseUrl, model, provider } = this.config;

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
    switch (this.config!.provider) {
      case 'openai':
      case 'custom':
        return data.choices?.[0]?.message?.content || '';
      case 'anthropic':
        return data.content?.[0]?.text || '';
      case 'gemini':
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
