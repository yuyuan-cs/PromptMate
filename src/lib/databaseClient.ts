// 数据库客户端 - 通过IPC与主进程中的SQLite数据库通信

interface DatabaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class DatabaseClient {
  private get electron() {
    return (window as any).electronAPI;
  }

  private async invoke<T>(channel: string, ...args: any[]): Promise<T> {
    const api = this.electron;
    if (!api || typeof api.invoke !== 'function') {
      throw new Error('Electron API 不可用');
    }

    const result: DatabaseResponse<T> = await api.invoke(channel, ...args);

    if (!result?.success) {
      throw new Error(result?.error || '数据库操作失败');
    }

    return result.data as T;
  }

  // 数据库状态
  async getStatus() {
    const api = this.electron;
    if (!api) {
      return { initialized: false, available: false, fallbackMode: true };
    }

    try {
      let result;
      if (typeof api.getDatabaseStatus === 'function') {
        result = await api.getDatabaseStatus();
      } else if (typeof api.invoke === 'function') {
        result = await api.invoke('get-database-status');
      } else {
        return { initialized: false, available: false, fallbackMode: true };
      }

      // 确保返回正确的格式
      return {
        initialized: Boolean(result?.initialized),
        available: Boolean(result?.available),
        fallbackMode: Boolean(result?.fallbackMode),
        status: result?.status || null
      };
    } catch (error) {
      console.error('获取数据库状态失败:', error);
      return { initialized: false, available: false, fallbackMode: true };
    }
  }

  async initialize() {
    const api = this.electron;
    if (api && typeof api.initializeDatabase === 'function') {
      return await api.initializeDatabase();
    }
    if (api && typeof api.invoke === 'function') {
      return await api.invoke('initialize-database');
    }
    throw new Error('Electron API 不可用');
  }

  async getMigrationStatus() {
    return await this.invoke<string>('db-get-migration-status');
  }

  async migrateFromLocalStorage(data: any) {
    return await this.invoke<void>('db-migrate-from-localstorage', data);
  }

  // 提示词操作
  async getAllPrompts() {
    return await this.invoke<any[]>('db-get-all-prompts');
  }

  async getPromptById(id: string) {
    return await this.invoke<any>('db-get-prompt-by-id', id);
  }

  async createPrompt(prompt: any) {
    return await this.invoke<any>('db-create-prompt', prompt);
  }

  async updatePrompt(id: string, updates: any) {
    return await this.invoke<any>('db-update-prompt', id, updates);
  }

  async deletePrompt(id: string) {
    return await this.invoke<boolean>('db-delete-prompt', id);
  }

  // 分类操作
  async getAllCategories() {
    return await this.invoke<any[]>('db-get-all-categories');
  }

  async createCategory(category: any) {
    return await this.invoke<any>('db-create-category', category);
  }

  async updateCategoryLanguage(language: string) {
    return await this.invoke<void>('db-update-category-language', language);
  }

  async updatePromptsLanguage(language: string) {
    return await this.invoke<void>('db-update-prompts-language', language);
  }

  // 标签操作
  async getAllTags() {
    return await this.invoke<string[]>('db-get-all-tags');
  }

  async getTagsByCategory(categoryId: string) {
    return await this.invoke<string[]>('db-get-tags-by-category', categoryId);
  }

  // 设置操作
  async getAllSettings() {
    return await this.invoke<Record<string, any>>('db-get-all-settings');
  }

  async setSetting(key: string, value: any) {
    return await this.invoke<void>('db-set-setting', key, value);
  }

  // 检查是否可用
  isAvailable(): boolean {
    try {
      const api = this.electron;
      if (!api) {
        console.log('Electron API 不存在');
        return false;
      }

      const hasInvoke = typeof api.invoke === 'function';
      const hasGetDatabaseStatus = typeof api.getDatabaseStatus === 'function';
      
      console.log('API 检查:', {
        hasElectronAPI: !!api,
        hasInvoke,
        hasGetDatabaseStatus,
        available: hasInvoke || hasGetDatabaseStatus
      });

      return hasInvoke || hasGetDatabaseStatus;
    } catch (error) {
      console.error('检查 Electron API 可用性时出错:', error);
      return false;
    }
  }
}

export const databaseClient = new DatabaseClient();
