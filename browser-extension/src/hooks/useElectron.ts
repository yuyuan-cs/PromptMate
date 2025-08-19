import { useState, useEffect, useCallback } from 'react';

// 检查是否在Electron环境中运行
const isElectron = () => {
  return window.electronAPI !== undefined;
};

/**
 * 获取应用设置
 */
export const useSettings = () => {
  const [settings, setSettings] = useState({
    theme: 'system',
    font: 'system-ui',
    fontSize: 14,
    alwaysOnTop: false,
    globalShortcut: 'CommandOrControl+Alt+P'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载设置
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isElectron()) {
        // 从Electron主进程获取设置
        const result = await window.electronAPI.getSettings();
        setSettings(result);
      } else {
        // 在非Electron环境中使用localStorage
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载设置失败');
      console.error('加载设置出错:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存设置
  const saveSettings = useCallback(async (newSettings: Partial<typeof settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      if (isElectron()) {
        // 通过Electron主进程保存设置
        await window.electronAPI.saveSettings(updatedSettings);
      } else {
        // 在非Electron环境中使用localStorage
        localStorage.setItem('settings', JSON.stringify(updatedSettings));
      }
      
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存设置失败');
      console.error('保存设置出错:', err);
      return false;
    }
  }, [settings]);

  // 切换窗口置顶
  const togglePinWindow = useCallback((shouldPin: boolean) => {
    if (isElectron()) {
      window.electronAPI.togglePinWindow(shouldPin);
    }
    
    // 更新本地状态
    setSettings(prev => ({
      ...prev,
      alwaysOnTop: shouldPin
    }));
  }, []);

  // 初始加载设置
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    togglePinWindow
  };
};

/**
 * 管理提示词数据
 */
export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
  }>>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载提示词数据
  const loadPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isElectron()) {
        // 从Electron主进程获取提示词
        const result = await window.electronAPI.getPrompts();
        setPrompts(result.prompts);
      } else {
        // 在非Electron环境中使用localStorage
        const savedPrompts = localStorage.getItem('prompts');
        if (savedPrompts) {
          setPrompts(JSON.parse(savedPrompts));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载提示词失败');
      console.error('加载提示词出错:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存提示词数据
  const savePrompts = useCallback(async (newPrompts: typeof prompts) => {
    try {
      if (isElectron()) {
        // 通过Electron主进程保存提示词
        await window.electronAPI.savePrompts({ prompts: newPrompts });
      } else {
        // 在非Electron环境中使用localStorage
        localStorage.setItem('prompts', JSON.stringify(newPrompts));
      }
      
      setPrompts(newPrompts);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存提示词失败');
      console.error('保存提示词出错:', err);
      return false;
    }
  }, []);

  // 获取选中的提示词
  const getSelectedPromptData = useCallback(() => {
    if (!selectedPrompt) return null;
    return prompts.find(prompt => prompt.id === selectedPrompt) || null;
  }, [selectedPrompt, prompts]);

  // 添加提示词
  const addPrompt = useCallback(async (prompt: Omit<typeof prompts[0], 'id'>) => {
    const newPrompt = {
      ...prompt,
      id: Date.now().toString()
    };
    
    const newPrompts = [...prompts, newPrompt];
    const success = await savePrompts(newPrompts);
    
    if (success) {
      setSelectedPrompt(newPrompt.id);
    }
    
    return success;
  }, [prompts, savePrompts]);

  // 更新提示词
  const updatePrompt = useCallback(async (id: string, data: Partial<Omit<typeof prompts[0], 'id'>>) => {
    const index = prompts.findIndex(prompt => prompt.id === id);
    if (index === -1) return false;
    
    const newPrompts = [...prompts];
    newPrompts[index] = {
      ...newPrompts[index],
      ...data
    };
    
    return savePrompts(newPrompts);
  }, [prompts, savePrompts]);

  // 删除提示词
  const deletePrompt = useCallback(async (id: string) => {
    const newPrompts = prompts.filter(prompt => prompt.id !== id);
    const success = await savePrompts(newPrompts);
    
    if (success && selectedPrompt === id) {
      setSelectedPrompt(null);
    }
    
    return success;
  }, [prompts, savePrompts, selectedPrompt]);

  // 导出数据
  const exportData = useCallback(async (filePath: string) => {
    if (isElectron()) {
      return window.electronAPI.exportData({ filePath });
    }
    
    // 在非Electron环境中，实现一个简单的导出
    try {
      const data = {
        prompts: prompts,
        settings: localStorage.getItem('settings') 
          ? JSON.parse(localStorage.getItem('settings')!) 
          : null
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'promptmate-export.json';
      a.click();
      
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      console.error('导出数据出错:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : '导出数据失败' 
      };
    }
  }, [prompts]);

  // 导入数据
  const importData = useCallback(async (filePath: string) => {
    if (isElectron()) {
      const result = await window.electronAPI.importData({ filePath });
      if (result.success) {
        await loadPrompts();
      }
      return result;
    }
    
    // 非Electron环境中不直接支持导入，需要用户自行选择文件
    return { 
      success: false, 
      error: '非Electron环境不支持直接导入，请使用桌面版应用。' 
    };
  }, [loadPrompts]);

  // 初始加载提示词
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  return {
    prompts,
    selectedPrompt,
    setSelectedPrompt,
    loading,
    error,
    loadPrompts,
    getSelectedPromptData,
    addPrompt,
    updatePrompt,
    deletePrompt,
    exportData,
    importData
  };
}; 