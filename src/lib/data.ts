import { Prompt, Category, Settings } from "../types";
import { Workflow, WorkflowExecution, WorkflowTemplate } from "../types/workflow";

// 从JSON文件导入默认数据
import defaultCategoriesData from '../data/categories.zh.json';
import samplePromptsData from '../data/prompts.zh.json';
import defaultSettingsData from '../data/settings.zh.json';
import builtInWorkflowTemplatesData from '../data/workflow-templates.zh.json';

// 类型断言，确保导入的数据符合我们的类型定义
export const defaultCategories: Category[] = defaultCategoriesData as Category[];
export const defaultSettings: Settings = defaultSettingsData as Settings;
export const builtInWorkflowTemplates: WorkflowTemplate[] = builtInWorkflowTemplatesData as WorkflowTemplate[];

// 对于包含动态数据的提示词，我们需要处理一下
export const samplePrompts: Prompt[] = samplePromptsData.map(p => ({
  ...p,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));


// 数据存储键名
const STORAGE_KEYS = {
  PROMPTS: 'promptmate-prompts',
  CATEGORIES: 'promptmate-categories',
  SETTINGS: 'promptmate-settings',
  WORKFLOWS: 'promptmate-workflows',
  WORKFLOW_EXECUTIONS: 'promptmate-workflow-executions'
};

// 加载提示词
export const loadPrompts = (): Prompt[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    if (saved) {
      return JSON.parse(saved);
    }
    return samplePrompts;
  } catch (error) {
    console.error("加载提示词时出错:", error);
    return samplePrompts;
  }
};

// 保存提示词
export const savePrompts = (prompts: Prompt[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
  } catch (error) {
    console.error("保存提示词时出错:", error);
  }
};

// 加载分类
export const loadCategories = (): Category[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultCategories;
  } catch (error) {
    console.error("加载分类时出错:", error);
    return defaultCategories;
  }
};

// 保存分类
export const saveCategories = (categories: Category[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error("保存分类时出错:", error);
  }
};

// 加载设置
export const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultSettings;
  } catch (error) {
    console.error("加载设置时出错:", error);
    return defaultSettings;
  }
};

// 保存设置
export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("保存设置时出错:", error);
  }
};

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// 导出所有数据为JSON
export const exportAllData = (): string => {
  try {
    const data = {
      prompts: loadPrompts(),
      categories: loadCategories(),
      settings: loadSettings(),
      userPreferences: loadUserPreferences(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("导出数据时出错:", error);
    return "";
  }
};

// 加载用户偏好设置
const loadUserPreferences = () => {
  try {
    const PREFERENCES_STORAGE_KEY = 'promptmate-user-preferences';
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // 这里是同步调用，在实际应用中可能需要异步处理
      // 但为了保持导出函数的同步特性，我们使用localStorage作为fallback
      const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } else {
      const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    }
  } catch (error) {
    console.error("加载用户偏好设置失败:", error);
    return null;
  }
};

// 从JSON导入数据
export const importAllData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    // 验证数据结构
    if (!data.prompts || !Array.isArray(data.prompts)) {
      throw new Error("提示词数据无效");
    }
    
    if (!data.categories || !Array.isArray(data.categories)) {
      throw new Error("分类数据无效");
    }
    
    // 保存导入的数据
    if (data.prompts) savePrompts(data.prompts);
    if (data.categories) saveCategories(data.categories);
    if (data.settings) saveSettings(data.settings);
    if (data.userPreferences) saveUserPreferences(data.userPreferences);
    
    return true;
  } catch (error) {
    console.error("导入数据时出错:", error);
    return false;
  }
};

// 保存用户偏好设置
const saveUserPreferences = (preferences: any) => {
  try {
    const PREFERENCES_STORAGE_KEY = 'promptmate-user-preferences';
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // 异步保存，但在同步函数中使用localStorage作为fallback
      chrome.storage.local.set({
        [PREFERENCES_STORAGE_KEY]: preferences
      }).catch(console.error);
      // 同时保存到localStorage确保立即生效
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } else {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    }
  } catch (error) {
    console.error("保存用户偏好设置失败:", error);
  }
};

// 导出提示词到文件
export const exportPromptsToFile = () => {
  const prompts = loadPrompts();
  const dataStr = JSON.stringify(prompts, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `promptmate-prompts-${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

// 导出分类到文件
export const exportCategoriesToFile = () => {
  const categories = loadCategories();
  const dataStr = JSON.stringify(categories, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `promptmate-categories-${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

// 将提示词按类别分组
export const groupPromptsByCategory = (prompts: Prompt[]): Record<string, Prompt[]> => {
  const grouped: Record<string, Prompt[]> = {};
  
  prompts.forEach(prompt => {
    if (!grouped[prompt.category]) {
      grouped[prompt.category] = [];
    }
    grouped[prompt.category].push(prompt);
  });
  
  return grouped;
};

// 获取所有标签
export const getAllTags = (prompts: Prompt[]): string[] => {
  const tags = new Set<string>();
  
  prompts.forEach(prompt => {
    prompt.tags.forEach(tag => tags.add(tag));
  });
  
  return Array.from(tags).sort();
};

// 清除所有数据（谨慎使用）
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROMPTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (error) {
    console.error("清除数据时出错:", error);
  }
};

// 重置为默认数据
export const resetToDefaults = (): void => {
  try {
    savePrompts(samplePrompts);
    saveCategories(defaultCategories);
    saveSettings(defaultSettings);
    saveWorkflows([]);
    saveWorkflowExecutions([]);
  } catch (error) {
    console.error("重置为默认数据时出错:", error);
  }
};

// 工作流相关数据操作
export const loadWorkflows = (): Workflow[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    console.error("加载工作流时出错:", error);
    return [];
  }
};

export const saveWorkflows = (workflows: Workflow[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  } catch (error) {
    console.error("保存工作流时出错:", error);
  }
};

export const loadWorkflowExecutions = (): WorkflowExecution[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKFLOW_EXECUTIONS);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    console.error("加载工作流执行记录时出错:", error);
    return [];
  }
};

export const saveWorkflowExecutions = (executions: WorkflowExecution[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKFLOW_EXECUTIONS, JSON.stringify(executions));
  } catch (error) {
    console.error("保存工作流执行记录时出错:", error);
  }
};
