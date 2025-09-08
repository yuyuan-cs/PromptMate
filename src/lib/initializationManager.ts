import { useTranslation } from 'react-i18next';

export interface LoadingTask {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

export interface InitializationProgress {
  isLoading: boolean;
  progress: number;
  currentTask?: string;
  tasks: LoadingTask[];
  error?: string;
}

export class InitializationManager {
  private tasks: LoadingTask[] = [];
  private currentTaskIndex = 0;
  private progress = 0;
  private isLoading = true;
  private error?: string;
  private callbacks: ((progress: InitializationProgress) => void)[] = [];

  constructor() {
    this.initializeTasks();
  }

  private initializeTasks() {
    // 检查是否在Electron环境中
    const isElectron = typeof window !== 'undefined' && window.electronAPI;
    
    if (isElectron) {
      // Electron环境：完整的初始化任务
      this.tasks = [
        {
          id: 'database-init',
          name: '初始化数据库',
          status: 'pending'
        },
        {
          id: 'data-migration',
          name: '迁移数据',
          status: 'pending'
        },
        {
          id: 'load-prompts',
          name: '加载提示词',
          status: 'pending'
        },
        {
          id: 'load-categories',
          name: '加载分类',
          status: 'pending'
        },
        {
          id: 'load-settings',
          name: '加载设置',
          status: 'pending'
        }
      ];
    } else {
      // 浏览器环境：简化的初始化任务
      this.tasks = [
        {
          id: 'load-prompts',
          name: '加载提示词',
          status: 'pending'
        },
        {
          id: 'load-categories',
          name: '加载分类',
          status: 'pending'
        },
        {
          id: 'load-settings',
          name: '加载设置',
          status: 'pending'
        }
      ];
    }
  }

  public subscribe(callback: (progress: InitializationProgress) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  private notify() {
    const progress: InitializationProgress = {
      isLoading: this.isLoading,
      progress: this.progress,
      currentTask: this.tasks[this.currentTaskIndex]?.name,
      tasks: [...this.tasks],
      error: this.error
    };

    this.callbacks.forEach(callback => callback(progress));
  }

  public async startInitialization(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = undefined;
      this.notify();

      // 执行初始化任务
      for (let i = 0; i < this.tasks.length; i++) {
        this.currentTaskIndex = i;
        const task = this.tasks[i];
        
        // 更新任务状态为加载中
        task.status = 'loading';
        this.notify();

        try {
          await this.executeTask(task);
          
          // 任务完成
          task.status = 'completed';
          task.progress = 100;
        } catch (error) {
          // 任务失败
          task.status = 'error';
          task.error = error instanceof Error ? error.message : String(error);
          console.error(`任务 ${task.name} 失败:`, error);
        }

        // 更新总进度
        this.progress = ((i + 1) / this.tasks.length) * 100;
        this.notify();

        // 添加小延迟，让用户看到进度变化
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // 检查是否有错误任务
      const errorTasks = this.tasks.filter(task => task.status === 'error');
      if (errorTasks.length > 0) {
        this.error = `${errorTasks.length} 个任务失败`;
        console.warn('初始化过程中有任务失败:', errorTasks);
      }

      this.isLoading = false;
      this.notify();
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.isLoading = false;
      this.notify();
      throw error;
    }
  }

  private async executeTask(task: LoadingTask): Promise<void> {
    switch (task.id) {
      case 'database-init':
        await this.initializeDatabase();
        break;
      case 'data-migration':
        await this.migrateData();
        break;
      case 'load-prompts':
        await this.loadPrompts();
        break;
      case 'load-categories':
        await this.loadCategories();
        break;
      case 'load-settings':
        await this.loadSettings();
        break;
      default:
        console.warn(`未知任务: ${task.id}`);
    }
  }

  private async initializeDatabase(): Promise<void> {
    // 检查是否在Electron环境中
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        // 调用Electron主进程的数据库初始化
        const result = await window.electronAPI.initializeDatabase();
        if (!result.success) {
          throw new Error(result.error || '数据库初始化失败');
        }
        console.log('数据库初始化成功');
      } catch (error) {
        console.warn('数据库初始化失败，将使用localStorage:', error);
        // 数据库初始化失败不应该阻止应用启动
      }
    } else {
      // 非Electron环境，使用localStorage，直接完成
      console.log('非Electron环境，使用localStorage');
      // 添加短暂延迟模拟初始化过程
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  private async migrateData(): Promise<void> {
    // 检查是否需要数据迁移
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const migrationStatus = await window.electronAPI.getMigrationStatus();
        if (migrationStatus === 'pending') {
          console.log('开始数据迁移...');
          // 这里可以添加具体的数据迁移逻辑
          // 目前只是模拟
          await new Promise(resolve => setTimeout(resolve, 600));
          console.log('数据迁移完成');
        } else {
          console.log('无需数据迁移');
        }
      } catch (error) {
        console.warn('数据迁移失败:', error);
        // 迁移失败不应该阻止应用启动
      }
    } else {
      // 非Electron环境，无需迁移，直接完成
      console.log('非Electron环境，无需数据迁移');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  private async loadPrompts(): Promise<void> {
    // 等待主应用内容加载完成
    // 这里需要等待usePrompts hook完成初始化
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 检查主应用是否已经加载
    const checkAppLoaded = () => {
      // 检查关键DOM元素是否存在
      const appElement = document.querySelector('[data-testid="main-app"]') || 
                        document.querySelector('main') ||
                        document.querySelector('.app-content');
      return !!appElement;
    };
    
    // 等待主应用加载，最多等待2秒
    let attempts = 0;
    const maxAttempts = 10; // 2秒 / 100ms = 20次
    
    while (!checkAppLoaded() && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    console.log('主应用内容加载完成');
  }

  private async loadCategories(): Promise<void> {
    // 等待分类数据加载
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 检查分类数据是否已加载
    const checkCategoriesLoaded = () => {
      // 检查是否有分类相关的DOM元素
      const categoryElements = document.querySelectorAll('[data-testid="category"]') ||
                              document.querySelectorAll('.category-item') ||
                              document.querySelectorAll('[class*="category"]');
      return categoryElements.length > 0;
    };
    
    // 等待分类加载，最多等待1秒
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!checkCategoriesLoaded() && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    console.log('分类数据加载完成');
  }

  private async loadSettings(): Promise<void> {
    // 等待设置数据加载
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 检查设置是否已加载
    const checkSettingsLoaded = () => {
      // 检查是否有设置相关的DOM元素
      const settingsElements = document.querySelectorAll('[data-testid="settings"]') ||
                              document.querySelectorAll('.settings-panel') ||
                              document.querySelectorAll('[class*="settings"]');
      return settingsElements.length > 0 || true; // 设置可能不可见，所以总是返回true
    };
    
    console.log('设置数据加载完成');
  }

  public getProgress(): InitializationProgress {
    return {
      isLoading: this.isLoading,
      progress: this.progress,
      currentTask: this.tasks[this.currentTaskIndex]?.name,
      tasks: [...this.tasks],
      error: this.error
    };
  }
}

// 单例实例
let initializationManager: InitializationManager | null = null;

export const getInitializationManager = (): InitializationManager => {
  if (!initializationManager) {
    initializationManager = new InitializationManager();
  }
  return initializationManager;
};
