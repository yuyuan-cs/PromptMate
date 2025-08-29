import { Prompt, Category, Settings, UsageRecord, VariableValues } from './types';

export class StorageManager {
  private static instance: StorageManager;
  
  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // 获取所有提示词
  async getPrompts(): Promise<Prompt[]> {
    try {
      const result = await chrome.storage.local.get(['prompts']);
      return result.prompts || this.getDefaultPrompts();
    } catch (error) {
      console.error('获取提示词失败:', error);
      return this.getDefaultPrompts();
    }
  }

  // 保存提示词
  async savePrompts(prompts: Prompt[]): Promise<void> {
    try {
      await chrome.storage.local.set({ prompts });
    } catch (error) {
      console.error('保存提示词失败:', error);
      throw error;
    }
  }

  // 添加提示词
  async addPrompt(prompt: Prompt): Promise<void> {
    const prompts = await this.getPrompts();
    prompts.unshift(prompt);
    await this.savePrompts(prompts);
  }

  // 更新提示词
  async updatePrompt(id: string, updates: Partial<Prompt>): Promise<void> {
    const prompts = await this.getPrompts();
    const index = prompts.findIndex(p => p.id === id);
    if (index !== -1) {
      prompts[index] = { ...prompts[index], ...updates, updatedAt: new Date().toISOString() };
      await this.savePrompts(prompts);
    }
  }

  // 删除提示词
  async deletePrompt(id: string): Promise<void> {
    const prompts = await this.getPrompts();
    const filtered = prompts.filter(p => p.id !== id);
    await this.savePrompts(filtered);
  }

  // 获取分类
  async getCategories(): Promise<Category[]> {
    try {
      const result = await chrome.storage.local.get(['categories']);
      return result.categories || this.getDefaultCategories();
    } catch (error) {
      console.error('获取分类失败:', error);
      return this.getDefaultCategories();
    }
  }

  // 保存分类
  async saveCategories(categories: Category[]): Promise<void> {
    try {
      await chrome.storage.local.set({ categories });
    } catch (error) {
      console.error('保存分类失败:', error);
      throw error;
    }
  }

  // 添加分类
  async addCategory(category: Category): Promise<void> {
    const categories = await this.getCategories();
    categories.push(category);
    await this.saveCategories(categories);
  }

  // 获取设置
  async getSettings(): Promise<Settings> {
    try {
      const result = await chrome.storage.local.get(['settings']);
      return result.settings || this.getDefaultSettings();
    } catch (error) {
      console.error('获取设置失败:', error);
      return this.getDefaultSettings();
    }
  }

  // 保存设置
  async saveSettings(settings: Settings): Promise<void> {
    try {
      await chrome.storage.local.set({ settings });
    } catch (error) {
      console.error('保存设置失败:', error);
      throw error;
    }
  }

  // 记录使用情况
  async recordUsage(promptId: string, action: 'copy' | 'inject' | 'view'): Promise<void> {
    const record: UsageRecord = {
      promptId,
      timestamp: new Date().toISOString(),
      action
    };

    // 更新提示词的使用统计
    await this.updatePrompt(promptId, {
      usageCount: (await this.getPromptUsageCount(promptId)) + 1,
      lastUsed: record.timestamp
    });

    // 保存使用记录
    const records = await this.getUsageRecords();
    records.unshift(record);
    
    // 只保留最近1000条记录
    if (records.length > 1000) {
      records.splice(1000);
    }
    
    try {
      await chrome.storage.local.set({ usageRecords: records });
    } catch (error) {
      console.error('保存使用记录失败:', error);
    }
  }

  // 获取使用记录
  async getUsageRecords(): Promise<UsageRecord[]> {
    try {
      const result = await chrome.storage.local.get(['usageRecords']);
      return result.usageRecords || [];
    } catch (error) {
      console.error('获取使用记录失败:', error);
      return [];
    }
  }

  // 获取提示词使用次数
  private async getPromptUsageCount(promptId: string): Promise<number> {
    const prompts = await this.getPrompts();
    const prompt = prompts.find(p => p.id === promptId);
    return prompt?.usageCount || 0;
  }

  // 获取变量历史记录
  async getVariableHistory(promptId?: string): Promise<VariableValues[]> {
    try {
      const result = await chrome.storage.local.get(['variableHistory']);
      const allHistory = result.variableHistory || {};
      
      if (promptId) {
        return allHistory[promptId] || [];
      }
      
      // 返回所有历史记录
      const allRecords: VariableValues[] = [];
      Object.values(allHistory).forEach((records: any) => {
        if (Array.isArray(records)) {
          allRecords.push(...records);
        }
      });
      
      return allRecords;
    } catch (error) {
      console.error('获取变量历史记录失败:', error);
      return [];
    }
  }

  // 保存变量历史记录
  async saveVariableHistory(promptId: string, values: VariableValues): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['variableHistory']);
      const allHistory = result.variableHistory || {};
      const promptHistory = allHistory[promptId] || [];
      
      // 添加新记录到开头
      const newHistory = [values, ...promptHistory];
      
      // 去重（基于所有变量值的组合）
      const uniqueHistory = newHistory.filter((item, index, arr) => {
        return arr.findIndex(other => JSON.stringify(other) === JSON.stringify(item)) === index;
      });
      
      // 只保留最近的10条记录
      allHistory[promptId] = uniqueHistory.slice(0, 10);
      
      await chrome.storage.local.set({ variableHistory: allHistory });
    } catch (error) {
      console.error('保存变量历史记录失败:', error);
      throw error;
    }
  }

  // 清除变量历史记录
  async clearVariableHistory(promptId?: string): Promise<void> {
    try {
      if (promptId) {
        const result = await chrome.storage.local.get(['variableHistory']);
        const allHistory = result.variableHistory || {};
        delete allHistory[promptId];
        await chrome.storage.local.set({ variableHistory: allHistory });
      } else {
        await chrome.storage.local.remove(['variableHistory']);
      }
    } catch (error) {
      console.error('清除变量历史记录失败:', error);
      throw error;
    }
  }

  // 清空所有数据
  async clearAllData(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      console.error('清空数据失败:', error);
      throw error;
    }
  }

  // 重置为默认数据
  async resetToDefaults(): Promise<void> {
    try {
      await this.clearAllData();
      await this.savePrompts(this.getDefaultPrompts());
      await this.saveCategories(this.getDefaultCategories());
      await this.saveSettings(this.getDefaultSettings());
    } catch (error) {
      console.error('重置默认数据失败:', error);
      throw error;
    }
  }

  // 导出数据
  async exportData(): Promise<string> {
    try {
      const prompts = await this.getPrompts();
      const categories = await this.getCategories();
      const settings = await this.getSettings();
      
      const exportData = {
        prompts,
        categories,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('导出数据失败:', error);
      throw error;
    }
  }

  // 导入数据
  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.prompts) {
        await this.savePrompts(data.prompts);
      }
      if (data.categories) {
        await this.saveCategories(data.categories);
      }
      if (data.settings) {
        await this.saveSettings(data.settings);
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      throw error;
    }
  }

  // 默认提示词
  private getDefaultPrompts(): Prompt[] {
    return [
      {
        id: 'default-1',
        title: '产品介绍文案',
        content: '请为以下产品写一段吸引人的介绍文案：\n\n产品名称：{{产品名称}}\n主要功能：{{主要功能}}\n目标用户：{{目标用户}}\n\n要求：\n1. 突出产品核心价值\n2. 语言简洁有力\n3. 激发用户兴趣',
        description: '用于生成产品介绍的营销文案',
        tags: ['营销', '文案', '产品'],
        category: 'marketing',
        isFavorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: 'default-2',
        title: '代码审查',
        content: '请审查以下代码并提供改进建议：\n\n```{{编程语言}}\n{{代码内容}}\n```\n\n重点关注：\n1. 代码质量和可读性\n2. 性能优化机会\n3. 安全性问题\n4. 最佳实践\n5. 可维护性改进',
        description: '用于代码质量审查和优化建议',
        tags: ['编程', '审查', '优化'],
        category: 'development',
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: 'default-3',
        title: '邮件回复模板',
        content: '请帮我回复以下邮件：\n\n原邮件内容：\n{{原邮件内容}}\n\n回复要点：\n{{回复要点}}\n\n要求：\n- 使用{{语气}}的语气\n- 保持专业和礼貌\n- 逻辑清晰，重点突出',
        description: '专业邮件回复模板',
        tags: ['邮件', '沟通', '商务'],
        category: 'communication',
        isFavorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: 'default-4',
        title: '学习计划制定',
        content: '请为我制定一个{{学习主题}}的学习计划：\n\n学习目标：{{学习目标}}\n可用时间：{{可用时间}}\n当前水平：{{当前水平}}\n\n请提供：\n1. 详细的学习路径\n2. 时间安排建议\n3. 学习资源推荐\n4. 进度检查点\n5. 实践项目建议',
        description: '制定个性化学习计划',
        tags: ['学习', '计划', '教育'],
        category: 'education',
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: 'default-5',
        title: '创意写作',
        content: '请基于以下要素创作一个{{文体类型}}：\n\n主题：{{主题}}\n背景设定：{{背景设定}}\n主要角色：{{主要角色}}\n情节要求：{{情节要求}}\n\n创作要求：\n1. 情节生动有趣\n2. 人物性格鲜明\n3. 语言流畅自然\n4. 结构合理完整\n5. 字数约{{字数要求}}字',
        description: '创意写作和故事创作',
        tags: ['写作', '创意', '故事'],
        category: 'creative',
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      }
    ];
  }

  // 默认分类
  private getDefaultCategories(): Category[] {
    return [
      {
        id: 'marketing',
        name: '营销文案',
        icon: 'megaphone',
        color: '#ef4444',
        description: '产品推广、文案写作相关提示词'
      },
      {
        id: 'development',
        name: '编程开发',
        icon: 'code',
        color: '#3b82f6',
        description: '代码编写、调试、架构设计相关提示词'
      },
      {
        id: 'communication',
        name: '沟通交流',
        icon: 'message-circle',
        color: '#10b981',
        description: '邮件、会议、谈判等沟通场景提示词'
      },
      {
        id: 'education',
        name: '学习教育',
        icon: 'book-open',
        color: '#f59e0b',
        description: '学习计划、知识总结、教学相关提示词'
      },
      {
        id: 'creative',
        name: '创意写作',
        icon: 'pen-tool',
        color: '#8b5cf6',
        description: '创意写作、故事创作、内容生成提示词'
      },
      {
        id: 'business',
        name: '商务办公',
        icon: 'briefcase',
        color: '#06b6d4',
        description: '商务分析、报告撰写、项目管理提示词'
      }
    ];
  }

  // 默认设置
  private getDefaultSettings(): Settings {
    return {
      theme: 'auto',
      fontSize: 14,
      autoInject: false,
      showNotifications: true,
      defaultCategory: 'general',
      autoSave: true,
      maxHistory: 50,
      enableShortcuts: true,
      showUsageStats: true,
      compactMode: false,
      autoExportOnChange: false,
      allowList: [],
      blockList: []
    };
  }
}
