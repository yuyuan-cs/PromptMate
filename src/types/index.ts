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
