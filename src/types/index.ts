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
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  font: string;
  fontSize: number;
  alwaysOnTop: boolean;
  shortcut: string;
}

export type ThemeType = 'light' | 'dark' | 'system';

export interface RecommendedPrompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}
