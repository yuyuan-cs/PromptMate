// src/lib/themes.ts
import { ThemeType, Settings } from "@/types";

export interface ThemePreset {
  id: ThemeType;
  name: string;
  description: string;
  isDefault?: boolean;
  preview: {
    background: string;
    foreground: string;
    primary: string;
    accent: string;
  };
  variables: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

// 主题预设定义
export const themePresets: ThemePreset[] = [
    
  {
    id: "light",
    name: "默认浅色",
    description: "标准浅色主题，明亮简洁的设计",
    isDefault: true,
    preview: {
      background: "#ffffff",
      foreground: "#0f172a",
      primary: "#1d283a",
      accent: "#f1f5f9",
    },
    variables: {
      light: {},
      dark: {}
    }
  },
  {
    id: "dark",
    name: "默认深色",
    description: "标准深色主题，减少眼部疲劳",
    isDefault: true,
    preview: {
      background: "#0f172a",
      foreground: "#f8fafc",
      primary: "#f8fafc",
      accent: "#1e293b",
    },
    variables: {
      light: {},
      dark: {}
    }
  },
  {
    id: "blue",
    name: "蓝色主题",
    description: "专业稳重的蓝色调界面",
    isDefault: false,
    preview: {
      background: "#f0f9ff",
      foreground: "#0c4a6e",
      primary: "#0284c7",
      accent: "#e0f2fe",
    },
    variables: {
      light: {
        "--background": "210 100% 97%",
        "--foreground": "200 98% 24%",
        "--primary": "200 98% 39%",
        "--primary-foreground": "210 40% 98%",
        "--secondary": "199 100% 94%",
        "--secondary-foreground": "200 98% 39%",
        "--accent": "199 100% 94%",
        "--accent-foreground": "200 98% 39%",
        "--sidebar-background": "210 100% 98%",
        "--sidebar-foreground": "200 98% 24%",
        "--sidebar-primary": "200 98% 39%",
        "--sidebar-accent": "199 100% 96%"
      },
      dark: {}
    }
  },
  {
    id: "purple",
    name: "紫色主题",
    description: "创意紫色调，适合创意工作",
    isDefault: false,
    preview: {
      background: "#faf5ff",
      foreground: "#581c87",
      primary: "#9333ea",
      accent: "#f3e8ff",
    },
    variables: {
      light: {
        "--background": "270 100% 98%",
        "--foreground": "280 84% 32%",
        "--primary": "270 76% 56%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "270 100% 94%",
        "--secondary-foreground": "270 76% 56%",
        "--accent": "270 100% 94%",
        "--accent-foreground": "270 76% 56%",
        "--sidebar-background": "270 100% 99%",
        "--sidebar-foreground": "280 84% 32%",
        "--sidebar-primary": "270 76% 56%",
        "--sidebar-accent": "270 100% 96%"
      },
      dark: {}
    }
  },
  {
    id: "green",
    name: "绿色主题",
    description: "自然绿色主题，舒适护眼",
    isDefault: false,
    preview: {
      background: "#f0fdf4",
      foreground: "#14532d",
      primary: "#16a34a",
      accent: "#dcfce7",
    },
    variables: {
      light: {
        "--background": "140 84% 97%",
        "--foreground": "150 60% 20%",
        "--primary": "142 71% 36%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "140 84% 93%",
        "--secondary-foreground": "142 71% 36%",
        "--accent": "140 84% 93%",
        "--accent-foreground": "142 71% 36%",
        "--sidebar-background": "140 84% 98%",
        "--sidebar-foreground": "150 60% 20%",
        "--sidebar-primary": "142 71% 36%",
        "--sidebar-accent": "140 84% 96%"
      },
      dark: {}
    }
  },
  {
    id: "orange",
    name: "橙色主题",
    description: "活力橙色主题，充满能量",
    isDefault: false,
    preview: {
      background: "#fff7ed",
      foreground: "#9a3412",
      primary: "#ea580c",
      accent: "#fed7aa",
    },
    variables: {
      light: {
        "--background": "30 100% 98%",
        "--foreground": "20 90% 30%",
        "--primary": "25 95% 47%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "30 100% 94%",
        "--secondary-foreground": "25 95% 47%",
        "--accent": "30 100% 94%",
        "--accent-foreground": "25 95% 47%",
        "--sidebar-background": "30 100% 99%",
        "--sidebar-foreground": "20 90% 30%",
        "--sidebar-primary": "25 95% 47%",
        "--sidebar-accent": "30 100% 96%"
      },
      dark: {}
    }
  },
  {
    id: "red",
    name: "红色主题",
    description: "强调重点的红色主题",
    isDefault: false,
    preview: {
      background: "#fef2f2",
      foreground: "#7f1d1d",
      primary: "#dc2626",
      accent: "#fee2e2",
    },
    variables: {
      light: {
        "--background": "0 100% 97%",
        "--foreground": "0 80% 30%",
        "--primary": "0 72% 51%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "0 100% 94%",
        "--secondary-foreground": "0 72% 51%",
        "--accent": "0 100% 94%",
        "--accent-foreground": "0 72% 51%",
        "--sidebar-background": "0 100% 98%",
        "--sidebar-foreground": "0 80% 30%",
        "--sidebar-primary": "0 72% 51%",
        "--sidebar-accent": "0 100% 96%"
      },
      dark: {}
    }
  },
  {
    id: "midnight",
    name: "午夜蓝",
    description: "深邃优雅的暗色主题",
    isDefault: false,
    preview: {
      background: "#030712",
      foreground: "#e2e8f0",
      primary: "#3b82f6",
      accent: "#1e293b",
    },
    variables: {
      light: {
        "--background": "0 0% 98%",
        "--foreground": "222 47% 11%",
        "--primary": "217 91.2% 59.8%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "210 40% 96.1%",
        "--secondary-foreground": "222 47% 11%",
        "--accent": "210 40% 96.1%",
        "--accent-foreground": "222 47% 11%",
        "--sidebar-background": "214 32% 91%",
        "--sidebar-foreground": "222 47% 11%"
      },
      dark: {}
    }
  },
  {
    id: "coffee",
    name: "咖啡色",
    description: "温暖舒适的咖啡色调",
    isDefault: false,
    preview: {
      background: "#fdf8f6",
      foreground: "#44403c",
      primary: "#78350f",
      accent: "#fef3c7",
    },
    variables: {
      light: {
        "--background": "30 20% 98%",
        "--foreground": "20 10% 25%",
        "--primary": "25 95% 27%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "40 100% 92%",
        "--secondary-foreground": "25 95% 27%",
        "--accent": "40 100% 92%",
        "--accent-foreground": "25 95% 27%",
        "--sidebar-background": "30 20% 99%",
        "--sidebar-foreground": "20 10% 25%",
        "--sidebar-primary": "25 95% 27%",
        "--sidebar-accent": "40 100% 94%"
      },
      dark: {}
    }
  },

  // 自定义主题选项
  {
    id: "custom",
    name: "自定义主题",
    description: "根据个人喜好定制专属主题",
    isDefault: false,
    preview: {
      background: "linear-gradient(to bottom right, #ff7e5f, #feb47b)",
      foreground: "#000000",
      primary: "#ff7e5f",
      accent: "#ffffff",
    },
    variables: {
      light: {},
      dark: {}
    }
  }

];

// 获取主题预设
export function getThemePreset(themeId: ThemeType): ThemePreset | undefined {
  return themePresets.find(theme => theme.id === themeId);
}

// 应用主题变量
export function applyThemeVariables(theme: ThemeType, mode: 'light' | 'dark', customColors?: Settings['customTheme']): void {
  const preset = getThemePreset(theme);
  if (!preset) return;

  // 处理自定义主题
  if (theme === 'custom' && customColors) {
    // 应用自定义颜色
    applyCustomThemeVariables(customColors, mode);
    return;
  }

  // 处理预设主题
  if (preset.isDefault) {
    // 默认主题使用原有的CSS变量
    const variables = preset.variables[mode];
    if (!variables) return;

    // 应用CSS变量，但排除字体相关的变量
    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
      // 确保不覆盖字体相关的CSS变量
      if (!key.includes('font') && key !== '--app-font' && key !== '--app-font-size') {
        root.style.setProperty(key, value);
      }
    });
  } else {
    // 非默认主题使用智能深色化处理
    applyPresetThemeWithSmartDarkening(preset, mode);
  }
}

// 智能深色化预设主题
function applyPresetThemeWithSmartDarkening(preset: ThemePreset, mode: 'light' | 'dark'): void {
  const root = document.documentElement;
  const isDark = mode === 'dark';
  
  // 获取浅色模式的变量作为基础
  const lightVariables = preset.variables.light;
  if (!lightVariables) return;
  
  // 智能深色化处理
  Object.entries(lightVariables).forEach(([key, value]) => {
    // 确保不覆盖字体相关的CSS变量
    if (key.includes('font') || key === '--app-font' || key === '--app-font-size') {
      return;
    }
    
    let processedValue = value;
    
    if (isDark) {
      // 根据变量类型进行不同的深色化处理
      if (key.includes('background') || key.includes('card') || key.includes('popover')) {
        // 背景色：降低亮度
        processedValue = darkenColor(value, 0.4);
      } else if (key.includes('foreground') || key.includes('text')) {
        // 前景色：提高亮度
        processedValue = lightenColor(value, 0.3);
      } else if (key.includes('primary')) {
        // 主色调：适当提高亮度以保持可见性
        processedValue = lightenColor(value, 0.2);
      } else if (key.includes('accent') || key.includes('secondary') || key.includes('muted')) {
        // 强调色：降低亮度
        processedValue = darkenColor(value, 0.3);
      }
      
      // 确保对比度
      processedValue = adjustContrast(processedValue, isDark);
    }
    
    root.style.setProperty(key, processedValue);
  });
}

// 将十六进制颜色转换为HSL色值字符串 (#RRGGBB -> "H S% L%")
export function hexToHsl(hex: string): string {
    // 移除#前缀
    hex = hex.replace('#', '');
    
    // 解析RGB值
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // 计算HSL值
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
  
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h = Math.round(h * 60);
      s = Math.round(s * 100);
      l = Math.round(l * 100);
    }
    
    return `${h} ${s}% ${l}%`;
}

// 将HSL色值字符串转换为对象
export function hslToObject(hsl: string): { h: number; s: number; l: number } {
    const [h, s, l] = hsl.split(' ').map(val => parseFloat(val));
    return { h, s, l };
}

// 将HSL对象转换为字符串
export function hslToString(hsl: { h: number; s: number; l: number }): string {
    return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

// 智能深色化颜色处理
export function darkenColor(hsl: string, factor: number = 0.3): string {
    const color = hslToObject(hsl);
    
    // 降低亮度，但保持色相和饱和度
    color.l = Math.max(5, color.l * (1 - factor));
    
    // 适当调整饱和度，让深色模式更自然
    if (color.l < 20) {
        color.s = Math.min(100, color.s * 1.2);
    }
    
    return hslToString(color);
}

// 智能亮化颜色处理
export function lightenColor(hsl: string, factor: number = 0.3): string {
    const color = hslToObject(hsl);
    
    // 提高亮度，但保持色相和饱和度
    color.l = Math.min(95, color.l * (1 + factor));
    
    // 适当调整饱和度，让浅色模式更自然
    if (color.l > 80) {
        color.s = Math.max(0, color.s * 0.8);
    }
    
    return hslToString(color);
}

// 智能对比度调整
export function adjustContrast(hsl: string, isDark: boolean): string {
    const color = hslToObject(hsl);
    
    if (isDark) {
        // 深色模式下，确保文字有足够的对比度
        if (color.l > 70) {
            color.l = Math.max(85, color.l);
        } else if (color.l < 30) {
            color.l = Math.min(15, color.l);
        }
    } else {
        // 浅色模式下，确保文字有足够的对比度
        if (color.l > 70) {
            color.l = Math.max(85, color.l);
        } else if (color.l < 30) {
            color.l = Math.min(15, color.l);
        }
    }
    
    return hslToString(color);
}
  
// 应用自定义主题变量
function applyCustomThemeVariables(colors: Settings['customTheme'], mode: 'light' | 'dark'): void {
    if (!colors) return;
    
    const root = document.documentElement;
    const isDark = mode === 'dark';
    
    // 转换十六进制颜色到HSL格式
    const bgHsl = hexToHsl(colors.background);
    const fgHsl = hexToHsl(colors.foreground);
    const primaryHsl = hexToHsl(colors.primary);
    const accentHsl = hexToHsl(colors.accent);
    
    // 智能深色化处理
    const processedBgHsl = isDark ? darkenColor(bgHsl, 0.4) : bgHsl;
    const processedFgHsl = isDark ? lightenColor(fgHsl, 0.3) : fgHsl;
    const processedPrimaryHsl = isDark ? lightenColor(primaryHsl, 0.2) : primaryHsl;
    const processedAccentHsl = isDark ? darkenColor(accentHsl, 0.3) : accentHsl;
    
    // 确保对比度
    const finalFgHsl = adjustContrast(processedFgHsl, isDark);
    const finalPrimaryHsl = adjustContrast(processedPrimaryHsl, isDark);
    
    // 设置基本变量
    root.style.setProperty('--background', processedBgHsl);
    root.style.setProperty('--foreground', finalFgHsl);
    root.style.setProperty('--primary', finalPrimaryHsl);
    root.style.setProperty('--primary-foreground', isDark ? '0 0% 100%' : '0 0% 0%');
    root.style.setProperty('--accent', processedAccentHsl);
    root.style.setProperty('--accent-foreground', finalFgHsl);
    
    // 派生其他变量
    root.style.setProperty('--card', processedBgHsl);
    root.style.setProperty('--card-foreground', finalFgHsl);
    root.style.setProperty('--popover', processedBgHsl);
    root.style.setProperty('--popover-foreground', finalFgHsl);
    root.style.setProperty('--secondary', processedAccentHsl);
    root.style.setProperty('--secondary-foreground', finalFgHsl);
    root.style.setProperty('--muted', processedAccentHsl);
    root.style.setProperty('--muted-foreground', finalFgHsl);
    root.style.setProperty('--border', processedAccentHsl);
    
    // 侧边栏变量
    root.style.setProperty('--sidebar-background', processedBgHsl);
    root.style.setProperty('--sidebar-foreground', finalFgHsl);
    root.style.setProperty('--sidebar-primary', finalPrimaryHsl);
    root.style.setProperty('--sidebar-primary-foreground', isDark ? '0 0% 100%' : '0 0% 0%');
    root.style.setProperty('--sidebar-accent', processedAccentHsl);
    root.style.setProperty('--sidebar-accent-foreground', finalFgHsl);
}