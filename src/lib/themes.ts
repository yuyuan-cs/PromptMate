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
      dark: {
        "--background": "202 80% 16%",
        "--foreground": "210 40% 98%",
        "--primary": "199 89% 48%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "200 50% 20%",
        "--secondary-foreground": "210 40% 98%",
        "--accent": "200 50% 20%",
        "--accent-foreground": "210 40% 98%",
        "--sidebar-background": "203 70% 16%",
        "--sidebar-foreground": "210 40% 98%",
        "--sidebar-primary": "199 89% 48%",
        "--sidebar-accent": "200 50% 18%"
      }
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
      dark: {
        "--background": "280 60% 15%",
        "--foreground": "270 20% 96%",
        "--primary": "270 76% 56%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "280 30% 20%",
        "--secondary-foreground": "270 20% 96%",
        "--accent": "280 30% 20%",
        "--accent-foreground": "270 20% 96%",
        "--sidebar-background": "280 50% 14%",
        "--sidebar-foreground": "270 20% 96%",
        "--sidebar-primary": "270 76% 56%",
        "--sidebar-accent": "280 30% 18%"
      }
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
      dark: {
        "--background": "145 55% 14%",
        "--foreground": "140 10% 96%",
        "--primary": "142 71% 36%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "145 25% 18%",
        "--secondary-foreground": "140 10% 96%",
        "--accent": "145 25% 18%",
        "--accent-foreground": "140 10% 96%",
        "--sidebar-background": "145 45% 13%",
        "--sidebar-foreground": "140 10% 96%",
        "--sidebar-primary": "142 71% 36%",
        "--sidebar-accent": "145 25% 16%"
      }
    }
  },
  {
    id: "orange",
    name: "橙色主题",
    description: "充满活力的橙色主题",
    isDefault: false,
    preview: {
      background: "#fff7ed",
      foreground: "#7c2d12",
      primary: "#ea580c",
      accent: "#ffedd5",
    },
    variables: {
      light: {
        "--background": "30 100% 96%",
        "--foreground": "15 80% 28%",
        "--primary": "23 96% 48%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "30 100% 92%",
        "--secondary-foreground": "23 96% 48%",
        "--accent": "30 100% 92%",
        "--accent-foreground": "23 96% 48%",
        "--sidebar-background": "30 100% 97%",
        "--sidebar-foreground": "15 80% 28%",
        "--sidebar-primary": "23 96% 48%",
        "--sidebar-accent": "30 100% 94%"
      },
      dark: {
        "--background": "20 60% 15%",
        "--foreground": "30 10% 92%",
        "--primary": "23 96% 48%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "20 30% 18%",
        "--secondary-foreground": "30 10% 92%",
        "--accent": "20 30% 18%",
        "--accent-foreground": "30 10% 92%",
        "--sidebar-background": "20 50% 14%",
        "--sidebar-foreground": "30 10% 92%",
        "--sidebar-primary": "23 96% 48%",
        "--sidebar-accent": "20 30% 16%"
      }
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
      dark: {
        "--background": "0 60% 15%",
        "--foreground": "0 10% 92%",
        "--primary": "0 72% 51%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "0 30% 18%",
        "--secondary-foreground": "0 10% 92%",
        "--accent": "0 30% 18%",
        "--accent-foreground": "0 10% 92%",
        "--sidebar-background": "0 50% 14%",
        "--sidebar-foreground": "0 10% 92%",
        "--sidebar-primary": "0 72% 51%",
        "--sidebar-accent": "0 30% 16%"
      }
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
      dark: {
        "--background": "222 84% 5%",
        "--foreground": "210 40% 98%",
        "--primary": "217 91.2% 59.8%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "217 32% 18%",
        "--secondary-foreground": "210 40% 98%",
        "--accent": "217 32% 18%",
        "--accent-foreground": "210 40% 98%",
        "--sidebar-background": "222 74% 5%",
        "--sidebar-foreground": "210 40% 98%"
      }
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
      dark: {
        "--background": "25 30% 16%",
        "--foreground": "30 5% 92%",
        "--primary": "40 92% 75%",
        "--primary-foreground": "25 30% 16%",
        "--secondary": "25 20% 20%",
        "--secondary-foreground": "30 5% 92%",
        "--accent": "25 20% 20%",
        "--accent-foreground": "30 5% 92%",
        "--sidebar-background": "25 25% 15%",
        "--sidebar-foreground": "30 5% 92%",
        "--sidebar-primary": "40 92% 75%",
        "--sidebar-accent": "25 20% 18%"
      }
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

  const variables = preset.variables[mode];
  if (!variables) return;

  // 应用CSS变量
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
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
    
    // 设置基本变量
    root.style.setProperty('--background', bgHsl);
    root.style.setProperty('--foreground', fgHsl);
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--primary-foreground', isDark ? '0 0% 100%' : '0 0% 0%');
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--accent-foreground', fgHsl);
    
    // 派生其他变量
    root.style.setProperty('--card', bgHsl);
    root.style.setProperty('--card-foreground', fgHsl);
    root.style.setProperty('--popover', bgHsl);
    root.style.setProperty('--popover-foreground', fgHsl);
    root.style.setProperty('--secondary', accentHsl);
    root.style.setProperty('--secondary-foreground', fgHsl);
    root.style.setProperty('--muted', accentHsl);
    root.style.setProperty('--muted-foreground', fgHsl);
    root.style.setProperty('--border', accentHsl);
    
    // 侧边栏变量
    root.style.setProperty('--sidebar-background', bgHsl);
    root.style.setProperty('--sidebar-foreground', fgHsl);
    root.style.setProperty('--sidebar-primary', primaryHsl);
    root.style.setProperty('--sidebar-primary-foreground', isDark ? '0 0% 100%' : '0 0% 0%');
    root.style.setProperty('--sidebar-accent', accentHsl);
    root.style.setProperty('--sidebar-accent-foreground', fgHsl);
  }