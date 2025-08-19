// 提示词类型定义
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  tags: string[];
  category: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
  lastUsed?: string;
}

// 分类类型定义
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  promptCount?: number;
}

// 搜索过滤器
export interface SearchFilters {
  searchTerm: string;
  selectedCategory: string;
  selectedTag: string | null;
  showFavorites: boolean;
  showRecommended: boolean;
}

// 设置类型
export interface Settings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  autoInject: boolean;
  showNotifications: boolean;
  defaultCategory: string;
  autoSave: boolean;
  maxHistory: number;
  enableShortcuts: boolean;
  showUsageStats: boolean;
  compactMode: boolean;
}

// 使用记录
export interface UsageRecord {
  promptId: string;
  timestamp: string;
  action: 'copy' | 'inject' | 'view';
}

// 变量值
export interface VariableValues {
  [key: string]: string;
}