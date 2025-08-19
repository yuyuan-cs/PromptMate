export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
  images?: PromptImage[];
  // 版本管理
  version: number;
  versions?: PromptVersion[];
  // 评分功能
  rating?: number; // 1-5星评分
  ratingNotes?: string; // 评分备注
}

export interface PromptImage {
  id: string;
  data: string; // Base64编码的图片数据
  caption?: string; // 图片说明
}

// 提示词版本管理
export interface PromptVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  description?: string;
  images?: PromptImage[];
  createdAt: string;
  changeNotes?: string; // 版本变更说明
}

// 提示词对比功能
export interface PromptComparison {
  id: string;
  promptId: string;
  promptTitle: string;
  promptVersion: number;
  createdAt: string;
  results: ComparisonResult[];
  notes?: string; // 对比备注
}

export interface ComparisonResult {
  id: string;
  modelProvider: string; // 模型提供商 (OpenAI, Anthropic, etc.)
  modelName: string; // 具体模型名称
  response: string; // AI响应内容
  responseTime: number; // 响应时间(ms)
  rating?: number; // 1-5星评分
  notes?: string; // 备注
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export type ThemeType =
  | 'light' 
  | 'dark' 
  | 'system'
  | 'blue' 
  | 'purple' 
  | 'green' 
  | 'orange' 
  | 'red'
  | 'midnight' 
  | 'coffee'
  | 'custom';

export interface Settings {
  theme: ThemeType;
  font: string;
  fontSize: number;
  alwaysOnTop: boolean;
  shortcut: string;
  customTheme?: {
    background: string;
    foreground: string;
    primary: string;
    accent: string;
  };
}

export interface RecommendedPrompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}
