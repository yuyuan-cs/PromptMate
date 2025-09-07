/**
 * 系统字体检测工具
 * 用于检测用户系统中已安装的字体
 */

export interface SystemFont {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
  weight: number;
  stretch: number;
  unicodeRange: string;
  monospace: boolean;
  serif: boolean;
  sansSerif: boolean;
  cursive: boolean;
  fantasy: boolean;
  system: boolean;
}

// 字体分类
export interface FontCategory {
  name: string;
  fonts: SystemFont[];
}

// 预定义字体分类
export const FONT_CATEGORIES = {
  SYSTEM: 'System Fonts',
  SERIF: 'Serif Fonts', 
  SANS_SERIF: 'Sans Serif Fonts',
  MONOSPACE: 'Monospace Fonts',
  DISPLAY: 'Display Fonts',
  HANDWRITING: 'Handwriting Fonts',
  OTHER: 'Other Fonts'
} as const;

// 常用字体列表（作为备选）
export const COMMON_FONTS = [
  // 系统字体
  'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
  // 中文字体
  'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimSun', 'SimHei', 'KaiTi', 'FangSong',
  // 英文字体
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS',
  // 等宽字体
  'Courier New', 'Monaco', 'Consolas', 'Source Code Pro', 'Fira Code', 'JetBrains Mono'
];

/**
 * 检测系统字体
 * 使用FontFace API检测已安装的字体
 */
export class FontDetector {
  private static instance: FontDetector;
  private detectedFonts: SystemFont[] = [];
  private isDetecting = false;
  private detectionPromise: Promise<SystemFont[]> | null = null;

  private constructor() {}

  static getInstance(): FontDetector {
    if (!FontDetector.instance) {
      FontDetector.instance = new FontDetector();
    }
    return FontDetector.instance;
  }

  /**
   * 检测系统字体
   */
  async detectSystemFonts(): Promise<SystemFont[]> {
    if (this.detectedFonts.length > 0) {
      return this.detectedFonts;
    }

    if (this.isDetecting && this.detectionPromise) {
      return this.detectionPromise;
    }

    this.isDetecting = true;
    this.detectionPromise = this.performDetection();
    
    try {
      this.detectedFonts = await this.detectionPromise;
      return this.detectedFonts;
    } finally {
      this.isDetecting = false;
      this.detectionPromise = null;
    }
  }

  /**
   * 执行字体检测
   */
  private async performDetection(): Promise<SystemFont[]> {
    const fonts: SystemFont[] = [];

    try {
      // 方法1: 使用FontFace API (现代浏览器)
      if ('fonts' in document && 'values' in document.fonts) {
        const fontFaceSet = await document.fonts.values();
        for (const fontFace of fontFaceSet) {
          fonts.push(this.fontFaceToSystemFont(fontFace));
        }
      }

      // 方法2: 使用Canvas检测 (兼容性更好)
      const canvasFonts = await this.detectFontsWithCanvas();
      fonts.push(...canvasFonts);

      // 方法3: 检测常用字体
      const commonFonts = await this.detectCommonFonts();
      fonts.push(...commonFonts);

      // 去重并排序
      return this.deduplicateAndSortFonts(fonts);
    } catch (error) {
      console.warn('字体检测失败，使用默认字体列表:', error);
      return this.getDefaultFonts();
    }
  }

  /**
   * 将FontFace转换为SystemFont
   */
  private fontFaceToSystemFont(fontFace: FontFace): SystemFont {
    return {
      family: fontFace.family,
      fullName: fontFace.family,
      postscriptName: fontFace.family,
      style: fontFace.style,
      weight: typeof fontFace.weight === 'string' ? this.parseWeight(fontFace.weight) : fontFace.weight,
      stretch: typeof fontFace.stretch === 'string' ? this.parseStretch(fontFace.stretch) : fontFace.stretch,
      unicodeRange: '',
      monospace: this.isMonospace(fontFace.family),
      serif: this.isSerif(fontFace.family),
      sansSerif: this.isSansSerif(fontFace.family),
      cursive: this.isCursive(fontFace.family),
      fantasy: this.isFantasy(fontFace.family),
      system: this.isSystemFont(fontFace.family)
    };
  }

  /**
   * 使用Canvas检测字体
   */
  private async detectFontsWithCanvas(): Promise<SystemFont[]> {
    const fonts: SystemFont[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return fonts;

    // 设置测试文本
    const testText = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const baselineFont = 'monospace';
    
    // 测量基线字体宽度
    ctx.font = `12px ${baselineFont}`;
    const baselineWidth = ctx.measureText(testText).width;

    // 测试每个常用字体
    for (const fontFamily of COMMON_FONTS) {
      try {
        ctx.font = `12px ${fontFamily}`;
        const width = ctx.measureText(testText).width;
        
        // 如果宽度不同，说明字体已安装
        if (Math.abs(width - baselineWidth) > 1) {
          fonts.push({
            family: fontFamily,
            fullName: fontFamily,
            postscriptName: fontFamily,
            style: 'normal',
            weight: 400,
            stretch: 100,
            unicodeRange: '',
            monospace: this.isMonospace(fontFamily),
            serif: this.isSerif(fontFamily),
            sansSerif: this.isSansSerif(fontFamily),
            cursive: this.isCursive(fontFamily),
            fantasy: this.isFantasy(fontFamily),
            system: this.isSystemFont(fontFamily)
          });
        }
      } catch (error) {
        // 忽略单个字体检测错误
      }
    }

    return fonts;
  }

  /**
   * 检测常用字体
   */
  private async detectCommonFonts(): Promise<SystemFont[]> {
    const fonts: SystemFont[] = [];
    
    for (const fontFamily of COMMON_FONTS) {
      fonts.push({
        family: fontFamily,
        fullName: fontFamily,
        postscriptName: fontFamily,
        style: 'normal',
        weight: 400,
        stretch: 100,
        unicodeRange: '',
        monospace: this.isMonospace(fontFamily),
        serif: this.isSerif(fontFamily),
        sansSerif: this.isSansSerif(fontFamily),
        cursive: this.isCursive(fontFamily),
        fantasy: this.isFantasy(fontFamily),
        system: this.isSystemFont(fontFamily)
      });
    }

    return fonts;
  }

  /**
   * 去重并排序字体
   */
  private deduplicateAndSortFonts(fonts: SystemFont[]): SystemFont[] {
    const fontMap = new Map<string, SystemFont>();
    
    // 去重
    fonts.forEach(font => {
      const key = font.family.toLowerCase();
      if (!fontMap.has(key) || fontMap.get(key)!.system) {
        fontMap.set(key, font);
      }
    });

    // 排序
    return Array.from(fontMap.values()).sort((a, b) => {
      // 系统字体优先
      if (a.system && !b.system) return -1;
      if (!a.system && b.system) return 1;
      
      // 按名称排序
      return a.family.localeCompare(b.family);
    });
  }

  /**
   * 获取默认字体列表
   */
  private getDefaultFonts(): SystemFont[] {
    return COMMON_FONTS.map(fontFamily => ({
      family: fontFamily,
      fullName: fontFamily,
      postscriptName: fontFamily,
      style: 'normal',
      weight: 400,
      stretch: 100,
      unicodeRange: '',
      monospace: this.isMonospace(fontFamily),
      serif: this.isSerif(fontFamily),
      sansSerif: this.isSansSerif(fontFamily),
      cursive: this.isCursive(fontFamily),
      fantasy: this.isFantasy(fontFamily),
      system: this.isSystemFont(fontFamily)
    }));
  }

  /**
   * 解析字体权重
   */
  private parseWeight(weight: string): number {
    const weightMap: Record<string, number> = {
      'normal': 400,
      'bold': 700,
      'lighter': 300,
      'bolder': 600,
      '100': 100,
      '200': 200,
      '300': 300,
      '400': 400,
      '500': 500,
      '600': 600,
      '700': 700,
      '800': 800,
      '900': 900
    };
    return weightMap[weight] || 400;
  }

  /**
   * 解析字体拉伸
   */
  private parseStretch(stretch: string): number {
    const stretchMap: Record<string, number> = {
      'ultra-condensed': 50,
      'extra-condensed': 62.5,
      'condensed': 75,
      'semi-condensed': 87.5,
      'normal': 100,
      'semi-expanded': 112.5,
      'expanded': 125,
      'extra-expanded': 150,
      'ultra-expanded': 200
    };
    return stretchMap[stretch] || 100;
  }

  /**
   * 判断是否为等宽字体
   */
  private isMonospace(fontFamily: string): boolean {
    const monospaceFonts = [
      'Courier New', 'Monaco', 'Consolas', 'Source Code Pro', 'Fira Code', 
      'JetBrains Mono', 'Menlo', 'Monaco', 'Ubuntu Mono', 'Roboto Mono'
    ];
    return monospaceFonts.some(font => 
      fontFamily.toLowerCase().includes(font.toLowerCase())
    );
  }

  /**
   * 判断是否为衬线字体
   */
  private isSerif(fontFamily: string): boolean {
    const serifFonts = [
      'Times New Roman', 'Georgia', 'Times', 'Serif', 'SimSun', 'KaiTi', 'FangSong'
    ];
    return serifFonts.some(font => 
      fontFamily.toLowerCase().includes(font.toLowerCase())
    );
  }

  /**
   * 判断是否为无衬线字体
   */
  private isSansSerif(fontFamily: string): boolean {
    const sansSerifFonts = [
      'Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Microsoft YaHei',
      'PingFang SC', 'Hiragino Sans GB', 'SimHei'
    ];
    return sansSerifFonts.some(font => 
      fontFamily.toLowerCase().includes(font.toLowerCase())
    );
  }

  /**
   * 判断是否为手写字体
   */
  private isCursive(fontFamily: string): boolean {
    const cursiveFonts = ['Comic Sans MS', 'Brush Script MT', 'Lucida Handwriting'];
    return cursiveFonts.some(font => 
      fontFamily.toLowerCase().includes(font.toLowerCase())
    );
  }

  /**
   * 判断是否为装饰字体
   */
  private isFantasy(fontFamily: string): boolean {
    const fantasyFonts = ['Impact', 'Papyrus', 'Chalkduster'];
    return fantasyFonts.some(font => 
      fontFamily.toLowerCase().includes(font.toLowerCase())
    );
  }

  /**
   * 判断是否为系统字体
   */
  private isSystemFont(fontFamily: string): boolean {
    const systemFonts = [
      'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
      'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei'
    ];
    return systemFonts.some(font => 
      fontFamily.toLowerCase().includes(font.toLowerCase())
    );
  }

  /**
   * 按分类组织字体
   */
  categorizeFonts(fonts: SystemFont[]): FontCategory[] {
    const categories: FontCategory[] = [];
    const categoryMap = new Map<string, SystemFont[]>();

    // 初始化分类
    Object.values(FONT_CATEGORIES).forEach(categoryName => {
      categoryMap.set(categoryName, []);
    });

    // 分类字体
    fonts.forEach(font => {
      if (font.system) {
        categoryMap.get(FONT_CATEGORIES.SYSTEM)!.push(font);
      } else if (font.monospace) {
        categoryMap.get(FONT_CATEGORIES.MONOSPACE)!.push(font);
      } else if (font.serif) {
        categoryMap.get(FONT_CATEGORIES.SERIF)!.push(font);
      } else if (font.sansSerif) {
        categoryMap.get(FONT_CATEGORIES.SANS_SERIF)!.push(font);
      } else if (font.cursive) {
        categoryMap.get(FONT_CATEGORIES.HANDWRITING)!.push(font);
      } else if (font.fantasy) {
        categoryMap.get(FONT_CATEGORIES.DISPLAY)!.push(font);
      } else {
        categoryMap.get(FONT_CATEGORIES.OTHER)!.push(font);
      }
    });

    // 转换为数组
    categoryMap.forEach((fonts, categoryName) => {
      if (fonts.length > 0) {
        categories.push({
          name: categoryName,
          fonts: fonts.sort((a, b) => a.family.localeCompare(b.family))
        });
      }
    });

    return categories;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.detectedFonts = [];
    this.isDetecting = false;
    this.detectionPromise = null;
  }
}

// 导出单例实例
export const fontDetector = FontDetector.getInstance();

