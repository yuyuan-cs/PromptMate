import { useState, useEffect, useCallback } from 'react';
import { Settings, ThemeType } from '../types';
import { loadSettings, saveSettings } from '../lib/data';
import { useToast } from '@/hooks/use-toast';
import { applyThemeVariables, getThemePreset } from '../lib/themes';

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
// 设置主题
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const { toast } = useToast();

  // 加载设置
  useEffect(() => {
    const savedSettings = loadSettings();
    setSettings(savedSettings);
  }, []);

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
  }, [settings.theme]);

  // 应用主题
  const applyTheme = useCallback((theme: ThemeType) => {
    const themePreset = getThemePreset(theme);
    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
    
    // 移除所有主题相关的类
    document.documentElement.classList.remove("light", "dark");
    
    // 先清除所有自定义主题变量
    resetThemeVariables();
    
    // 应用深色/浅色模式
    document.documentElement.classList.toggle('dark', isDark);
    
    // 如果是自定义主题，应用自定义变量
    if (theme === 'custom') {
      applyThemeVariables(theme, isDark ? 'dark' : 'light', settings.customTheme);
    } 
    // 如果是预设主题但不是默认主题，应用预设变量
    else if (themePreset && !themePreset.isDefault) {
      applyThemeVariables(theme, isDark ? 'dark' : 'light');
    }
  }, [systemTheme, settings.customTheme]);
  
  // 重置主题变量到默认状态
  const resetThemeVariables = useCallback(() => {
    const root = document.documentElement;
    const variableNames = [
      "--background", "--foreground", "--card", "--card-foreground",
      "--popover", "--popover-foreground", "--primary", "--primary-foreground",
      "--secondary", "--secondary-foreground", "--muted", "--muted-foreground",
      "--accent", "--accent-foreground", "--destructive", "--destructive-foreground",
      "--border", "--input", "--ring", "--sidebar-background", "--sidebar-foreground",
      "--sidebar-primary", "--sidebar-primary-foreground", "--sidebar-accent",
      "--sidebar-accent-foreground", "--sidebar-border", "--sidebar-ring"
    ];
    
    // 清除所有主题相关的CSS变量
    variableNames.forEach(varName => {
      root.style.removeProperty(varName);
    });
  }, []);

  // 应用字体和字体大小
  const applyFont = useCallback((fontName: string, fontSize: number) => {
    const fontFamily = FONT_FAMILIES[fontName as keyof typeof FONT_FAMILIES] || fontName;
    
    // 设置CSS变量
    document.documentElement.style.setProperty('--app-font', fontFamily);
    document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`);
    
    // 强制应用到整个文档
    document.documentElement.style.fontFamily = fontFamily;
    document.body.style.fontFamily = fontFamily;
    document.body.style.fontSize = `${fontSize}px`;
    // 设置合理的行高，而不是用fontSize来作为行高
    document.body.style.lineHeight = "1.5";
    
    // 强制所有文本元素使用指定字体，覆盖任何继承设置
    const styleElement = document.getElementById('font-override-style') || document.createElement('style');
    styleElement.id = 'font-override-style';
    styleElement.textContent = `
      * {
        font-family: ${fontFamily} !important;
      }
      body, p, div, span, h1, h2, h3, h4, h5, h6, button, input, textarea, select {
        font-size: ${fontSize}px !important;
        line-height: 1.5 !important;
      }
      pre, code {
        font-family: ${FONT_FAMILIES['Source Code Pro']} !important;
      }
    `;
    
    if (!document.getElementById('font-override-style')) {
      document.head.appendChild(styleElement);
    }
  }, []);

  // 保存设置
  useEffect(() => {
    saveSettings(settings);
    applyTheme(settings.theme);
    applyFont(settings.font, settings.fontSize);
  }, [settings, applyTheme, applyFont]);

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
    // 调用 Electron API 来实际控制窗口置顶
    if (window.electronAPI) {
      window.electronAPI.togglePinWindow(pinned);
    }
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
    settings, // 设置
    updateSettings, // 更新设置
    systemTheme, // 系统主题
    availableFonts, // 可用字体列表
    currentTheme: settings.theme === 'system' ? systemTheme : settings.theme, // 当前主题
    toggleTheme, // 切换主题
    togglePinWindow // 切换窗口置顶
  };
}
