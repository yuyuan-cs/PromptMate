import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    // 从存储中加载主题设置
    const loadTheme = async () => {
      try {
        const result = await chrome.storage.local.get(['theme']);
        const savedTheme = result.theme || 'system';
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } catch (error) {
        console.error('加载主题设置失败:', error);
      }
    };

    loadTheme();
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // 移除现有的主题类
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'system') {
      // 检测系统主题
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDarkMode ? 'dark' : 'light');
    } else {
      root.classList.add(newTheme);
    }
  };

  const changeTheme = async (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      applyTheme(newTheme);
      
      // 保存到存储
      await chrome.storage.local.set({ theme: newTheme });
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  };

  // 监听系统主题变化
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return {
    theme,
    setTheme: changeTheme,
  };
}

