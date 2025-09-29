/**
 * PromptX 对话理解引擎
 * 实现自然语言角色激活功能
 * 
 * 核心功能：
 * - 意图识别：识别用户是否想要激活角色
 * - 角色匹配：根据自然语言描述匹配专业角色
 * - 上下文提取：提取对话中的关键信息作为角色上下文
 */

export interface RoleActivationIntent {
  roleId: string;
  context: Record<string, any>;
  confidence: number;
  originalMessage: string;
  extractedKeywords: string[];
}

export interface Intent {
  type: 'role_activation' | 'general_query' | 'help_request';
  confidence: number;
  keywords: string[];
}

export interface RolePattern {
  pattern: RegExp;
  roleId: string;
  keywords: string[];
  priority: number;
}

export class DialogueEngine {
  private rolePatterns: RolePattern[] = [
    // 产品经理相关
    {
      pattern: /需要.*产品经理|产品.*专家|PM.*帮助|产品.*规划|需求.*分析/i,
      roleId: 'product-manager',
      keywords: ['产品经理', 'PM', '需求分析', '产品规划', '用户研究'],
      priority: 10
    },
    
    // 系统架构师相关
    {
      pattern: /需要.*架构师|系统.*设计|架构.*建议|技术.*架构|系统.*规划/i,
      roleId: 'architect',
      keywords: ['架构师', '系统设计', '技术架构', '系统规划'],
      priority: 10
    },
    
    // 文案策划相关
    {
      pattern: /需要.*文案|写.*文案|营销.*文本|内容.*创作|文案.*策划/i,
      roleId: 'copywriter',
      keywords: ['文案', '营销文本', '内容创作', '文案策划'],
      priority: 10
    },
    
    // 开发工程师相关
    {
      pattern: /需要.*开发|编程.*帮助|代码.*优化|技术.*实现|开发.*指导/i,
      roleId: 'developer',
      keywords: ['开发', '编程', '代码优化', '技术实现'],
      priority: 10
    },
    
    // UI/UX 设计师相关
    {
      pattern: /需要.*设计师|UI.*设计|UX.*设计|界面.*设计|用户.*体验/i,
      roleId: 'ui-designer',
      keywords: ['设计师', 'UI设计', 'UX设计', '界面设计', '用户体验'],
      priority: 10
    },
    
    // 数据分析师相关
    {
      pattern: /需要.*数据.*分析|数据.*专家|分析.*报告|数据.*洞察/i,
      roleId: 'data-analyst',
      keywords: ['数据分析', '数据专家', '分析报告', '数据洞察'],
      priority: 10
    },
    
    // 项目经理相关
    {
      pattern: /需要.*项目.*经理|项目.*管理|进度.*管理|团队.*协调/i,
      roleId: 'project-manager',
      keywords: ['项目经理', '项目管理', '进度管理', '团队协调'],
      priority: 10
    },
    
    // 通用专家匹配（优先级较低）
    {
      pattern: /需要.*专家|专业.*帮助|专业.*指导|专业.*建议/i,
      roleId: 'general-expert',
      keywords: ['专家', '专业帮助', '专业指导'],
      priority: 5
    }
  ];

  private activationKeywords = [
    '需要', '帮助', '专家', '协助', '指导', '建议', '咨询',
    '请教', '求助', '支持', '辅助', '配合', '合作'
  ];

  private contextKeywords = [
    '项目', '任务', '问题', '需求', '目标', '计划', '方案',
    '策略', '流程', '标准', '规范', '优化', '改进', '创新'
  ];

  /**
   * 解析用户意图并匹配角色
   */
  async parseUserIntent(message: string): Promise<RoleActivationIntent | null> {
    try {
      // 1. 意图识别
      const intent = this.identifyIntent(message);
      if (!intent || intent.type !== 'role_activation') {
        return null;
      }

      // 2. 角色匹配
      const matchedRole = this.matchRole(message);
      if (!matchedRole) {
        return null;
      }

      // 3. 上下文提取
      const context = this.extractContext(message);

      // 4. 关键词提取
      const extractedKeywords = this.extractKeywords(message);

      return {
        roleId: matchedRole.roleId,
        context,
        confidence: intent.confidence * (matchedRole.priority / 10),
        originalMessage: message,
        extractedKeywords
      };
    } catch (error) {
      console.error('DialogueEngine: 解析用户意图失败', error);
      return null;
    }
  }

  /**
   * 识别用户意图
   */
  private identifyIntent(message: string): Intent | null {
    const lowerMessage = message.toLowerCase();
    
    // 检查是否包含激活关键词
    const hasActivationIntent = this.activationKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    if (!hasActivationIntent) {
      return null;
    }

    // 计算置信度
    const matchedKeywords = this.activationKeywords.filter(keyword => 
      lowerMessage.includes(keyword)
    );
    
    const confidence = Math.min(0.9, 0.6 + (matchedKeywords.length * 0.1));

    return {
      type: 'role_activation',
      confidence,
      keywords: matchedKeywords
    };
  }

  /**
   * 匹配最合适的角色
   */
  private matchRole(message: string): RolePattern | null {
    const matches: Array<RolePattern & { score: number }> = [];

    for (const pattern of this.rolePatterns) {
      if (pattern.pattern.test(message)) {
        // 计算匹配分数
        let score = pattern.priority;
        
        // 关键词匹配加分
        const keywordMatches = pattern.keywords.filter(keyword => 
          message.toLowerCase().includes(keyword.toLowerCase())
        );
        score += keywordMatches.length * 2;

        matches.push({ ...pattern, score });
      }
    }

    if (matches.length === 0) {
      return null;
    }

    // 返回得分最高的角色
    return matches.sort((a, b) => b.score - a.score)[0];
  }

  /**
   * 提取对话上下文
   */
  private extractContext(message: string): Record<string, any> {
    const context: Record<string, any> = {
      originalMessage: message,
      timestamp: new Date().toISOString(),
      messageLength: message.length,
      language: this.detectLanguage(message)
    };

    // 提取上下文关键词
    const contextMatches = this.contextKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    if (contextMatches.length > 0) {
      context.contextKeywords = contextMatches;
    }

    // 提取可能的项目或任务描述
    const projectMatch = message.match(/项目[：:]\s*([^，。！？\n]+)/);
    if (projectMatch) {
      context.project = projectMatch[1].trim();
    }

    const taskMatch = message.match(/任务[：:]\s*([^，。！？\n]+)/);
    if (taskMatch) {
      context.task = taskMatch[1].trim();
    }

    return context;
  }

  /**
   * 提取关键词
   */
  private extractKeywords(message: string): string[] {
    const keywords: string[] = [];
    
    // 提取所有匹配的角色关键词
    for (const pattern of this.rolePatterns) {
      const matches = pattern.keywords.filter(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      keywords.push(...matches);
    }

    // 提取上下文关键词
    const contextMatches = this.contextKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    keywords.push(...contextMatches);

    // 去重并返回
    return [...new Set(keywords)];
  }

  /**
   * 检测语言
   */
  private detectLanguage(message: string): string {
    // 简单的中英文检测
    const chineseChars = message.match(/[\u4e00-\u9fff]/g);
    const englishChars = message.match(/[a-zA-Z]/g);
    
    const chineseRatio = chineseChars ? chineseChars.length / message.length : 0;
    const englishRatio = englishChars ? englishChars.length / message.length : 0;
    
    if (chineseRatio > 0.3) {
      return 'zh-CN';
    } else if (englishRatio > 0.5) {
      return 'en-US';
    }
    
    return 'auto';
  }

  /**
   * 获取角色建议
   */
  async suggestRoles(message: string): Promise<Array<{
    roleId: string;
    name: string;
    reason: string;
    confidence: number;
  }>> {
    const suggestions: Array<{
      roleId: string;
      name: string;
      reason: string;
      confidence: number;
    }> = [];

    // 基于关键词匹配提供建议
    for (const pattern of this.rolePatterns) {
      const keywordMatches = pattern.keywords.filter(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (keywordMatches.length > 0) {
        const confidence = Math.min(0.9, keywordMatches.length * 0.3);
        suggestions.push({
          roleId: pattern.roleId,
          name: this.getRoleName(pattern.roleId),
          reason: `检测到相关关键词: ${keywordMatches.join(', ')}`,
          confidence
        });
      }
    }

    // 按置信度排序，返回前5个建议
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * 获取角色名称
   */
  private getRoleName(roleId: string): string {
    const roleNames: Record<string, string> = {
      'product-manager': '产品经理',
      'architect': '系统架构师',
      'copywriter': '文案策划',
      'developer': '开发工程师',
      'ui-designer': 'UI/UX设计师',
      'data-analyst': '数据分析师',
      'project-manager': '项目经理',
      'general-expert': '通用专家'
    };
    
    return roleNames[roleId] || roleId;
  }

  /**
   * 验证角色激活意图
   */
  validateIntent(intent: RoleActivationIntent): boolean {
    return (
      intent.confidence > 0.5 &&
      intent.roleId.length > 0 &&
      intent.originalMessage.length > 5
    );
  }
}

// 导出单例实例
export const dialogueEngine = new DialogueEngine();
