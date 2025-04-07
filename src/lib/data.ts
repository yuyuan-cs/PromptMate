import { Prompt, Category, Settings } from "../types";

// Default categories
export const defaultCategories: Category[] = [
  { id: "general", name: "通用" },
  { id: "creative", name: "创意生成" },
  { id: "development", name: "开发编程" },
  { id: "business", name: "商务沟通" },
  { id: "education", name: "教育学习" },
  { id: "productivity", name: "生产力" }
];

// Sample prompts
export const samplePrompts: Prompt[] = [
  {
    id: "1",
    title: "代码解释器",
    content: "请解释以下代码的功能和实现原理，使用简单易懂的语言：\n\n```\n[在此粘贴代码]\n```",
    category: "development",
    tags: ["代码", "解释", "编程"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "故事创意生成器",
    content: "请构思一个有创意的故事，包含以下元素：[元素1]、[元素2]和[元素3]。故事类型为[类型]，适合[目标受众]阅读。",
    category: "creative",
    tags: ["写作", "创意", "故事"],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    title: "商务邮件撰写",
    content: "请帮我撰写一封关于[主题]的专业商务邮件，收件人是[收件人]。邮件语气应该[正式/友好/专业]，主要包含以下要点：\n1. [要点1]\n2. [要点2]\n3. [要点3]",
    category: "business",
    tags: ["邮件", "商务", "沟通"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "4",
    title: "学术论文结构",
    content: "请为一篇关于[主题]的学术论文创建详细大纲，包括引言、文献综述、方法论、讨论和结论等部分。请针对每个部分提供详细的子标题和内容建议。",
    category: "education",
    tags: ["学术", "论文", "写作"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "5",
    title: "会议总结生成器",
    content: "请根据以下会议记录生成一份简洁明了的会议总结：\n\n[会议记录]\n\n总结应包括：主要讨论点、做出的决策和后续行动项。",
    category: "productivity",
    tags: ["会议", "总结", "效率"],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Default settings
export const defaultSettings: Settings = {
  theme: "system",
  font: "Inter",
  fontSize: 14,
  alwaysOnTop: false,
  shortcut: "Control+Alt+P"
};

// 数据存储键名
const STORAGE_KEYS = {
  PROMPTS: 'promptmate-prompts',
  CATEGORIES: 'promptmate-categories',
  SETTINGS: 'promptmate-settings'
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
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("导出数据时出错:", error);
    return "";
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
    
    return true;
  } catch (error) {
    console.error("导入数据时出错:", error);
    return false;
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
  } catch (error) {
    console.error("重置为默认数据时出错:", error);
  }
};
