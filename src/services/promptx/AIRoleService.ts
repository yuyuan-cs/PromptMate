/**
 * PromptX AI 角色服务
 * 集成真实的 AI API，实现角色化对话
 */

import { RoleInstance } from './ProfessionalRoles';
import { professionalRolesManager } from './ProfessionalRoles';
import { aiService } from '@/services/aiService';
import { mcpConfigStore } from './MCPConfig';

// 导入现有的 AI 服务（假设已存在）
// import { aiService } from '@/services/AIService';

export interface AIRoleMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface AIRoleResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: string;
}

export class AIRoleService {
  private static instance: AIRoleService;
  
  private constructor() {}

  static getInstance(): AIRoleService {
    if (!AIRoleService.instance) {
      AIRoleService.instance = new AIRoleService();
    }
    return AIRoleService.instance;
  }

  /**
   * 发送角色化消息到 AI
   */
  async sendRoleMessage(
    message: string,
    activeRole: RoleInstance,
    conversationHistory: AIRoleMessage[] = []
  ): Promise<AIRoleResponse> {
    try {
      // 构建角色化的系统提示词
      const systemPrompt = this.buildRoleSystemPrompt(activeRole);
      
      // 构建完整的消息历史
      const messages: AIRoleMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      // 优先尝试通过本地 PromptX MCP 服务对话（若可用）
      const mcpReply = await this.tryMCPChat(activeRole.roleId, messages);
      if (mcpReply) {
        return mcpReply;
      }

      // MCP 不可用则回退至直连 AI 服务
      const aiConfig = this.getAIConfiguration();
      if (!aiConfig) {
        throw new Error('AI 服务未配置，请先在设置中配置 AI 服务');
      }

      const response = await this.callAIService(messages, aiConfig);
      
      return response;
    } catch (error) {
      console.error('AI 角色服务调用失败:', error);
      throw error;
    }
  }

  /**
   * 尝试通过本地 PromptX MCP 服务进行对话（HTTP 模式）
   * 约定：POST {endpoint}/chat，body: { roleId, messages }
   */
  private async tryMCPChat(roleId: string, messages: AIRoleMessage[]): Promise<AIRoleResponse | null> {
    try {
      const ep = mcpConfigStore.getActive();
      if (!ep || !ep.url || !(ep.url.startsWith('http://') || ep.url.startsWith('https://'))) {
        return null;
      }

      const response = await fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'chat.completion',
          params: { roleId, messages },
          id: `chat-${Date.now()}`,
        }),
      });

      if (!response.ok) return null;

      const rpcResponse = await response.json();

      if (rpcResponse.error) {
        console.error('[MCP Chat] Received RPC error:', rpcResponse.error);
        return null;
      }

      const result = rpcResponse.result;
      if (!result) return null;

      const content = result.content || result.reply || result.message || '';
      if (!content) return null;

      return {
        content,
        usage: result.usage,
        model: result.model,
        finishReason: result.finishReason || result.stop_reason,
      };
    } catch (e) {
      console.warn('[MCP Chat] Failed to call MCP chat endpoint:', e);
      return null;
    }
  }

  /**
   * 构建角色系统提示词
   */
  private buildRoleSystemPrompt(activeRole: RoleInstance): string {
    const roleDetails = professionalRolesManager.getRoleById(activeRole.roleId);
    
    if (!roleDetails) {
      return `你是一个专业的 ${activeRole.name} 助手。请以专业的角度回答用户的问题。`;
    }

    let systemPrompt = roleDetails.prompt_template;

    // 添加角色上下文信息
    if (activeRole.context && Object.keys(activeRole.context).length > 0) {
      systemPrompt += '\n\n当前对话上下文：\n';
      Object.entries(activeRole.context).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 0) {
          systemPrompt += `- ${key}: ${value}\n`;
        }
      });
    }

    // 添加角色特定的行为指导
    systemPrompt += `\n\n重要提醒：
1. 始终保持 ${activeRole.name} 的专业身份
2. 使用该领域的专业术语和方法论
3. 提供结构化、可执行的专业建议
4. 结合实际案例和最佳实践
5. 保持该角色的沟通风格和思维方式`;

    return systemPrompt;
  }

  /**
   * 获取 AI 配置
   */
  private getAIConfiguration() {
    try {
      // 首选统一服务：AISettings.tsx -> aiService.saveConfig()/getConfig()
      const cfg = aiService.getConfig();
      if (cfg && cfg.apiKey && cfg.provider) {
        return cfg;
      }

      // 兼容旧存储：读取 'ai-settings' 或回退 'ai-config'
      const rawSettings = localStorage.getItem('ai-settings') || localStorage.getItem('ai-config');
      if (!rawSettings) return null;
      const parsed = JSON.parse(rawSettings);
      const provider = parsed.provider || parsed.vendor || 'openai';
      const apiKey = parsed.apiKey || parsed.key || '';
      const baseUrl = parsed.baseUrl || parsed.endpoint || '';
      const model = parsed.model || parsed.modelName || '';
      if (!apiKey || !provider) return null;
      return { provider, apiKey, baseUrl, model };
    } catch (error) {
      console.error('获取 AI 配置失败:', error);
      return null;
    }
  }

  /**
   * 调用 AI 服务
   */
  private async callAIService(
    messages: AIRoleMessage[], 
    config: any
  ): Promise<AIRoleResponse> {
    
    // 如果存在现有的 AI 服务，使用它
    if (typeof window !== 'undefined' && (window as any).aiService) {
      return await this.useExistingAIService(messages, config);
    }

    // 否则直接调用 API
    return await this.directAPICall(messages, config);
  }

  /**
   * 使用现有的 AI 服务
   */
  private async useExistingAIService(
    messages: AIRoleMessage[], 
    config: any
  ): Promise<AIRoleResponse> {
    try {
      const aiService = (window as any).aiService;
      
      // 转换消息格式
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // 调用现有服务
      const response = await aiService.generateResponse(
        formattedMessages[formattedMessages.length - 1].content,
        {
          messages: formattedMessages,
          model: config.model || 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 2000
        }
      );

      return {
        content: response.content || response,
        usage: response.usage,
        model: response.model,
        finishReason: response.finishReason
      };
    } catch (error) {
      console.error('现有 AI 服务调用失败:', error);
      throw error;
    }
  }

  /**
   * 直接 API 调用
   */
  private async directAPICall(
    messages: AIRoleMessage[], 
    config: any
  ): Promise<AIRoleResponse> {
    
    const { provider, apiKey, baseUrl, model } = config;

    switch (provider) {
      case 'openai':
        return await this.callOpenAI(messages, { apiKey, baseUrl, model });
      case 'anthropic':
        return await this.callAnthropic(messages, { apiKey, model });
      case 'gemini':
        return await this.callGemini(messages, { apiKey, baseUrl, model });
      case 'custom':
        return await this.callCustomAPI(messages, config);
      default:
        throw new Error(`不支持的 AI 服务商: ${provider}`);
    }
  }

  /**
   * 调用 OpenAI API
   */
  private async callOpenAI(
    messages: AIRoleMessage[], 
    config: { apiKey: string; baseUrl?: string; model?: string }
  ): Promise<AIRoleResponse> {
    
    let url = config.baseUrl || 'https://api.openai.com';
    // 如果给的是根域名，则补齐端点
    if (url === 'https://api.openai.com' || url === 'https://api.openai.com/') {
      url = 'https://api.openai.com/v1/chat/completions';
    } else if (!url.includes('/v1/') && !url.includes('/chat/completions')) {
      url = `${url.replace(/\/$/, '')}/v1/chat/completions`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'gpt-3.5-turbo',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API 调用失败: ${response.status} ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage,
      model: data.model,
      finishReason: data.choices[0]?.finish_reason
    };
  }

  /**
   * 调用 Anthropic API
   */
  private async callAnthropic(
    messages: AIRoleMessage[], 
    config: { apiKey: string; model?: string }
  ): Promise<AIRoleResponse> {
    
    const url = 'https://api.anthropic.com/v1/messages';
    
    // 转换消息格式（Anthropic 格式略有不同）
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        system: systemMessage?.content,
        messages: conversationMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API 调用失败: ${response.status} ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0]?.text || '',
      usage: data.usage,
      model: data.model,
      finishReason: data.stop_reason
    };
  }

  /**
   * 调用 Gemini API（Google Generative Language）
   */
  private async callGemini(
    messages: AIRoleMessage[],
    config: { apiKey: string; baseUrl?: string; model?: string }
  ): Promise<AIRoleResponse> {
    const base = (config.baseUrl && config.baseUrl.includes('generativelanguage.googleapis.com'))
      ? config.baseUrl.replace(/\/$/, '')
      : 'https://generativelanguage.googleapis.com';

    const model = config.model || 'gemini-1.5-pro';
    // 组合系统提示与会话消息：Gemini没有原生system role，合并进第一条
    const system = messages.find(m => m.role === 'system')?.content || '';
    const userTurns = messages.filter(m => m.role !== 'system');

    const contents = userTurns.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: (m.role === 'user' && system) ? `${system}\n\n${m.content}` : m.content }]
    }));

    let url = `${base}/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}key=${encodeURIComponent(config.apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 2000, temperature: 0.7 } })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API 调用失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const content = Array.isArray(parts) ? parts.map((p: any) => p?.text || '').join('') : '';
    return { content, usage: data.usage, model: data.model, finishReason: data?.candidates?.[0]?.finishReason };
  }

  /**
   * 调用自定义 API
   */
  private async callCustomAPI(
    messages: AIRoleMessage[], 
    config: any
  ): Promise<AIRoleResponse> {
    
    // 对常见OpenAI兼容服务（如SiliconFlow）自动补全端点
    let url: string = config.baseUrl;
    if (typeof url === 'string') {
      const clean = url.replace(/\/$/, '');
      if (clean.includes('siliconflow')) {
        url = clean.includes('/v1/') ? clean : `${clean}/v1/chat/completions`;
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      },
      body: JSON.stringify({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model: config.model,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`自定义 API 调用失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 尝试解析不同的响应格式
    let content = '';
    if (data.choices && data.choices[0]?.message?.content) {
      content = data.choices[0].message.content;
    } else if (data.content) {
      content = data.content;
    } else if (data.response) {
      content = data.response;
    } else if (typeof data === 'string') {
      content = data;
    }

    return {
      content,
      usage: data.usage,
      model: data.model,
      finishReason: data.finish_reason || data.finishReason
    };
  }

  /**
   * 检查 AI 服务是否可用
   */
  async checkAIServiceAvailability(): Promise<boolean> {
    try {
      const config = this.getAIConfiguration();
      if (!config) {
        return false;
      }

      // 发送测试请求
      const testMessages: AIRoleMessage[] = [
        { role: 'user', content: 'Hello' }
      ];

      await this.callAIService(testMessages, config);
      return true;
    } catch (error) {
      console.error('AI 服务可用性检查失败:', error);
      return false;
    }
  }

  /**
   * 获取支持的模型列表
   */
  getSupportedModels(provider: string): string[] {
    const modelMap: Record<string, string[]> = {
      openai: [
        'gpt-4',
        'gpt-4-turbo-preview',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k'
      ],
      anthropic: [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307'
      ],
      custom: ['custom-model']
    };

    return modelMap[provider] || [];
  }
}

// 导出单例实例
export const aiRoleService = AIRoleService.getInstance();
