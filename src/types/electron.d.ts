interface ElectronAPI {
  // 设置管理
  getSettings: () => Promise<{
    theme: string;
    font: string;
    fontSize: number;
    alwaysOnTop: boolean;
    globalShortcut: string;
  }>;
  saveSettings: (settings: {
    theme?: string;
    font?: string;
    fontSize?: number;
    alwaysOnTop?: boolean;
    globalShortcut?: string;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // 提示词管理
  getPrompts: () => Promise<{
    prompts: {
      id: string;
      title: string;
      content: string;
      category: string;
      tags: string[];
    }[];
  }>;
  savePrompts: (data: {
    prompts: {
      id: string;
      title: string;
      content: string;
      category: string;
      tags: string[];
    }[];
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // 窗口控制
  togglePinWindow: (shouldPin: boolean) => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;

  // 数据导入导出
  exportData: (options: { filePath: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  importData: (options: { filePath: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

interface ElectronWindow {
  electron?: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    electron?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}

export {}; 