import { useState, useEffect } from 'react';
import { Settings, ThemeType } from '../types';
import { loadSettings, saveSettings } from '../lib/data';
import { useToast } from '@/hooks/use-toast';

// 字体映射
const FONT_FAMILIES = {
  'System UI': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'SF Pro': 'SF Pro, system-ui, sans-serif',
  'Inter': 'Inter var, sans-serif',
  'Source Code Pro': 'Source Code Pro, monospace',
  '思源黑体': '"Noto Sans SC", "Source Han Sans SC", "Source Han Sans CN", "思源黑体 CN", sans-serif',
  '思源宋体': '"Noto Serif SC", "Source Han Serif SC", "Source Han Serif CN", "思源宋体 CN", serif',
  '苹方': '"PingFang SC", "SF Pro SC", "苹方-简", sans-serif',
  '微软雅黑': '"Microsoft YaHei", "微软雅黑", sans-serif',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const { toast } = useToast();

  // 加载设置
  useEffect(() => {
    const savedSettings = loadSettings();
    setSettings(savedSettings);
  }, []);

  // 保存设置
  useEffect(() => {
    saveSettings(settings);
    applyTheme(settings.theme);
    applyFont(settings.font, settings.fontSize);
  }, [settings]);

  // 检测系统主题
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
      if (settings.theme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 应用主题
  const applyTheme = (theme: ThemeType) => {
    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
    document.documentElement.classList.toggle('dark', isDark);
  };

  // 应用字体和字体大小
  const applyFont = (fontName: string, fontSize: number) => {
    const fontFamily = FONT_FAMILIES[fontName as keyof typeof FONT_FAMILIES] || fontName;
    
    // 设置CSS变量
    document.documentElement.style.setProperty('--app-font', fontFamily);
    document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`);
    
    // 强制应用到整个文档
    document.documentElement.style.fontFamily = fontFamily;
    document.body.style.fontFamily = fontFamily;
    document.body.style.fontSize = `${fontSize}px`;
    
    // 强制所有文本元素使用指定字体，覆盖任何继承设置
    const styleElement = document.getElementById('font-override-style') || document.createElement('style');
    styleElement.id = 'font-override-style';
    styleElement.textContent = `
      * {
        font-family: ${fontFamily} !important;
      }
      pre, code {
        font-family: ${FONT_FAMILIES['Source Code Pro']} !important;
      }
    `;
    
    if (!document.getElementById('font-override-style')) {
      document.head.appendChild(styleElement);
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    // 检查字体是否变更
    if (newSettings.font && newSettings.font !== settings.font) {
      toast({
        title: "字体已更改",
        description: `当前字体: ${newSettings.font}`,
        variant: "success",
      });
    }
    
    // 检查字体大小是否变更
    if (newSettings.fontSize && newSettings.fontSize !== settings.fontSize) {
      toast({
        title: "字体大小已更改",
        description: `当前大小: ${newSettings.fontSize}px`,
        variant: "success",
      });
    }
    
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // 切换主题
  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  // 切换窗口置顶
  const togglePinWindow = (pinned: boolean) => {
    updateSettings({ alwaysOnTop: pinned });
    // 如果有Electron相关代码，可以在这里调用
  };

  // 可用字体列表
  const availableFonts = [
    { name: 'System UI', value: FONT_FAMILIES['System UI'] },
    { name: '思源黑体', value: FONT_FAMILIES['思源黑体'] },
    { name: '思源宋体', value: FONT_FAMILIES['思源宋体'] },
    { name: '苹方', value: FONT_FAMILIES['苹方'] },
    { name: '微软雅黑', value: FONT_FAMILIES['微软雅黑'] },
    { name: 'Inter', value: FONT_FAMILIES['Inter'] },
    { name: 'Source Code Pro', value: FONT_FAMILIES['Source Code Pro'] }
  ];

  return {
    settings,
    updateSettings,
    systemTheme,
    availableFonts,
    currentTheme: settings.theme === 'system' ? systemTheme : settings.theme,
    toggleTheme,
    togglePinWindow
  };
}
