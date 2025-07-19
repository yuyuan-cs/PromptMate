# 窗口控制API文档

## 概述

本文档描述了PromptMate应用中窗口控制相关的API接口和使用方法。

## Electron应用问题修复总结

### 问题描述
在运行Electron应用时出现以下问题：
1. **资源加载失败**：`Failed to load resource: net::ERR_FILE_NOT_FOUND`
2. **字体CSP策略问题**：字体加载被阻止
3. **安全警告**：webSecurity、allowRunningInsecureContent、CSP策略警告
4. **字体预加载警告**：未使用的字体资源
5. **界面空白**：应用无法正常显示

### 解决方案

#### 1. 修复字体加载问题
**问题**：fonts.css中使用了错误的字体URL格式
```css
/* 错误的格式 */
@font-face {
  src: url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap');
}

/* 正确的格式 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;500;700&family=Source+Code+Pro:wght@400;700&display=swap');
```

#### 2. 修复CSP策略
**问题**：CSP策略过于严格，阻止了必要的资源加载
```html
<!-- 修复后的CSP策略 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https:;" />
```

#### 3. 移除未使用的资源
**问题**：index.html中有未使用的字体预加载链接
```html
<!-- 移除这些未使用的预加载链接 -->
<!-- <link rel="preload" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap" as="style"> -->
<!-- <link rel="preload" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC&display=swap" as="style"> -->
```

#### 4. 优化Electron配置
**问题**：安全配置不正确
```javascript
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, 'preload.cjs'),
  webSecurity: true,  // 启用web安全
  allowRunningInsecureContent: false,  // 禁止运行不安全内容
  additionalArguments: [
    '--disable-features=VizDisplayCompositor'
  ]
}
```

#### 5. 添加调试信息
```javascript
// 添加页面加载状态监听
mainWindow.webContents.on('did-start-loading', () => {
  console.log('页面开始加载');
});

mainWindow.webContents.on('dom-ready', () => {
  console.log('DOM已就绪');
});

mainWindow.webContents.on('crashed', (event, killed) => {
  console.error('渲染进程崩溃:', killed);
});
```

### 修复结果

#### ✅ 已解决的问题
1. **字体加载**：使用正确的@import语法加载Google Fonts
2. **CSP策略**：放宽策略以支持开发环境
3. **资源警告**：移除未使用的字体预加载
4. **安全配置**：正确设置webSecurity和allowRunningInsecureContent
5. **调试信息**：添加详细的加载状态监控

#### 🔧 技术改进
1. **字体管理**：统一使用@import加载外部字体
2. **安全策略**：平衡安全性和功能性
3. **错误处理**：添加详细的错误日志
4. **开发体验**：提供更好的调试信息

### 使用说明

现在可以正常运行Electron应用：

```bash
# 启动开发服务器
npm run dev

# 启动Electron应用
npm run electron:start
```

### 注意事项

1. **开发环境**：CSP策略在开发环境中相对宽松，生产环境需要更严格
2. **字体加载**：确保网络连接正常以加载Google Fonts
3. **缓存问题**：如果仍有问题，可以清除Electron缓存
4. **端口冲突**：确保5173端口没有被其他应用占用

## 字体设置优化

### 问题描述
在之前的版本中，字体大小设置存在以下问题：
1. 设置字体大小后，再设置主题或字体样式时，字体大小会恢复到默认大小
2. 设置中字体大小的值不会正确更新
3. 主题切换时会影响字体设置

**根本原因分析**：
1. **CSS变量冲突**：在 `src/index.css` 中，`--app-font-size: 16px` 被硬编码，这会在主题切换时覆盖用户设置
2. **主题切换时的变量重置**：虽然我们保留了字体相关变量，但CSS中的默认值仍然会生效
3. **应用顺序问题**：主题切换和字体应用的时序问题导致字体设置被覆盖

### 解决方案
已对字体设置逻辑进行以下优化：

1. **修复CSS变量冲突**：
   - 将 `src/index.css` 中的 `--app-font-size` 从 `16px` 改为 `14px`，与 `defaultSettings` 保持一致
   - 使用 `!important` 确保字体CSS变量的优先级

2. **增强字体应用逻辑**：
   - 在 `applyFont` 函数中使用 `!important` 设置CSS变量
   - 在 `:root` 选择器中强制设置字体变量
   - 添加更强的样式覆盖机制

3. **优化应用顺序**：
   - 使用 `requestAnimationFrame` 确保在下一帧应用字体
   - 添加额外的 `setTimeout` 确保字体设置不被覆盖
   - 分离主题和字体的应用逻辑

4. **移除冲突逻辑**：
   - 从 `App.tsx` 中移除重复的字体设置逻辑
   - 移除 `ThemeProvider` 的使用，避免与 `useSettings` 中的主题管理产生冲突
   - 修复了 `sonner.tsx` 中的主题使用，使其与我们的主题管理兼容

5. **增强稳定性**：
   - 添加字体应用确认日志
   - 确保字体设置在各种情况下都能正确保持
   - 统一由 `useSettings` hook 管理所有字体相关设置

### 技术实现

```typescript
// 应用字体和字体大小 - 增强版本
const applyFont = useCallback((fontName: string, fontSize: number) => {
  const fontFamily = FONT_FAMILIES[fontName as keyof typeof FONT_FAMILIES] || fontName;
  
  // 设置CSS变量，使用!important确保优先级
  document.documentElement.style.setProperty('--app-font', fontFamily, 'important');
  document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`, 'important');
  
  // 强制应用到整个文档
  document.documentElement.style.fontFamily = fontFamily;
  document.body.style.fontFamily = fontFamily;
  document.body.style.fontSize = `${fontSize}px`;
  document.body.style.lineHeight = "1.5";
  
  // 强制所有文本元素使用指定字体，覆盖任何继承设置
  const styleElement = document.getElementById('font-override-style') || document.createElement('style');
  styleElement.id = 'font-override-style';
  styleElement.textContent = `
    :root {
      --app-font: ${fontFamily} !important;
      --app-font-size: ${fontSize}px !important;
    }
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
  
  console.log(`字体已应用: ${fontName} (${fontSize}px)`);
}, []);

// 保存设置并应用主题和字体 - 优化版本
useEffect(() => {
  saveSettings(settings);
  
  // 先应用主题
  applyTheme(settings.theme);
  
  // 主题应用完成后，立即应用字体设置
  // 使用 requestAnimationFrame 确保在下一帧应用字体
  requestAnimationFrame(() => {
    applyFont(settings.font, settings.fontSize);
  });
  
  // 额外确保字体设置不被覆盖
  setTimeout(() => {
    applyFont(settings.font, settings.fontSize);
  }, 50);
}, [settings, applyTheme, applyFont]);

// 单独监听字体和字体大小的变化，确保及时应用
useEffect(() => {
  applyFont(settings.font, settings.fontSize);
}, [settings.font, settings.fontSize, applyFont]);
```

### CSS修复

```css
/* 修复CSS变量冲突 */
:root {
  --app-font: system-ui, sans-serif;
  --app-font-size: 14px; /* 改为默认值14px，与defaultSettings一致 */
}

/* 基础样式 */
@layer base {
  body {
    @apply bg-background text-foreground;
    font-family: var(--app-font);
    font-size: var(--app-font-size);
    line-height: 1.5;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }
}
```

### 使用说明

现在用户可以：
1. 设置字体大小，该设置会在主题切换时保持不变
2. 切换主题时，字体大小设置会被正确保持
3. 字体大小设置会在设置界面中正确显示当前值
4. 字体设置具有更好的稳定性和一致性

## Windows窗口控制优化

### 问题描述
在Windows环境下，窗口控制按钮（最小化、最大化、关闭）存在以下问题：
1. **按钮无法点击**：preload脚本被禁用，导致electronAPI不可用
2. **视觉反馈不足**：按钮缺少合适的悬停和点击效果
3. **错误处理缺失**：没有适当的错误提示和调试信息
4. **兼容性问题**：在不同环境下缺少功能可用性检查

### 解决方案

#### 1. 启用preload脚本
**问题**：main.cjs中preload脚本被注释掉
```javascript
// 修复前
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  // preload: path.join(__dirname, 'preload.cjs'),  // 暂时禁用preload
  webSecurity: false,
  allowRunningInsecureContent: true
}

// 修复后
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, 'preload.cjs'),  // 启用preload脚本
  webSecurity: false,
  allowRunningInsecureContent: true
}
```

#### 2. 增强错误处理
**问题**：缺少API可用性检查和错误处理
```typescript
// 检查electronAPI是否可用
const isElectronAPIAvailable = () => {
  return window.electronAPI && 
         typeof window.electronAPI.minimize === 'function' &&
         typeof window.electronAPI.maximize === 'function' &&
         typeof window.electronAPI.close === 'function';
};

// 增强的窗口控制函数
const handleMinimize = () => {
  try {
    if (isElectronAPIAvailable()) {
      window.electronAPI.minimize();
      console.log('最小化窗口');
    } else {
      console.warn('electronAPI 不可用');
      toast({
        title: "功能不可用",
        description: "窗口控制功能在当前环境下不可用",
      });
    }
  } catch (error) {
    console.error('最小化窗口失败:', error);
    toast({
      title: "操作失败",
      description: "最小化窗口时发生错误",
      variant: "destructive",
    });
  }
};
```

#### 3. 优化CSS样式
**问题**：按钮缺少合适的交互效果
```css
/* Windows窗口控制按钮样式优化 */
.window-control-button {
  @apply transition-all duration-200 ease-in-out;
  @apply hover:bg-muted/60 active:bg-muted/80;
  @apply focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-1;
}

/* 关闭按钮特殊样式 */
.window-control-close {
  @apply hover:bg-destructive/10 hover:text-destructive;
  @apply active:bg-destructive/20;
}

/* 确保按钮在Windows下有足够的点击区域 */
.window-control-button {
  min-width: 36px;
  min-height: 36px;
  @apply flex items-center justify-center;
}
```

#### 4. 更新组件实现
```typescript
// 最小化按钮
<Button
  variant="ghost"
  size="icon"
  onClick={handleMinimize}
  className="rounded-full window-control-button titlebar-no-drag h-9 w-9"
>
  <Minus className="h-4 w-4" />
</Button>

// 最大化按钮
<Button
  variant="ghost"
  size="icon"
  onClick={handleMaximize}
  className="rounded-full window-control-button titlebar-no-drag h-9 w-9"
>
  <Maximize2 className="h-4 w-4" />
</Button>

// 关闭按钮
<Button
  variant="ghost"
  size="icon"
  onClick={handleClose}
  className="rounded-full window-control-button window-control-close titlebar-no-drag h-9 w-9"
>
  <X className="h-4 w-4" />
</Button>
```

### 修复结果

#### ✅ 已解决的问题
1. **功能可用性**：启用preload脚本，恢复窗口控制功能
2. **错误处理**：添加API可用性检查和详细的错误提示
3. **用户体验**：优化按钮样式，提供更好的视觉反馈
4. **调试支持**：添加控制台日志，便于问题排查

#### 🔧 技术改进
1. **代码健壮性**：增强错误处理和边界情况处理
2. **样式优化**：提供更好的交互体验和视觉反馈
3. **调试友好**：添加详细的日志和错误信息
4. **兼容性**：支持不同环境下的功能检测
5. **构建优化**：改进了Electron构建流程，确保文件正确部署

#### 🐛 问题排查步骤
1. **检查preload脚本路径**：确认preload.cjs文件存在于正确位置
2. **验证构建流程**：确保src/main/*.cjs文件正确复制到dist-electron/main/
3. **调试信息输出**：在preload脚本和Header组件中添加详细的调试日志
4. **API可用性检查**：添加isElectronAPIAvailable函数检查API是否可用
5. **错误提示优化**：当API不可用时显示友好的错误提示

#### 📝 最新修复（2024年7月19日）
- **构建流程修复**：解决了package.json中main字段指向dist-electron目录的问题
- **文件复制优化**：确保preload脚本正确复制到构建目录
- **调试信息增强**：添加了更详细的preload脚本加载状态检查
- **错误处理完善**：改进了API不可用时的用户提示

## 窗口控制API

### 1. 窗口置顶控制

**功能**: 控制应用窗口是否始终保持在最前面

**API接口**:
```typescript
// 切换窗口置顶状态
togglePinWindow(pinned: boolean): void
```

**使用示例**:
```typescript
import { useSettings } from '@/hooks/useSettings';

const { togglePinWindow, settings } = useSettings();

// 设置窗口置顶
togglePinWindow(true);

// 取消窗口置顶
togglePinWindow(false);

// 检查当前置顶状态
console.log(settings.alwaysOnTop);
```

### 2. 窗口最小化

**功能**: 最小化应用窗口

**API接口**:
```typescript
// 最小化窗口
window.electronAPI?.minimize();
```

**使用示例**:
```typescript
// 最小化窗口
const handleMinimize = () => {
  try {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    }
  } catch (error) {
    console.error('最小化窗口失败:', error);
  }
};
```

### 3. 窗口最大化/还原

**功能**: 最大化或还原应用窗口

**API接口**:
```typescript
// 最大化/还原窗口
window.electronAPI?.maximize();
```

**使用示例**:
```typescript
// 最大化/还原窗口
const handleMaximize = () => {
  try {
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize();
    }
  } catch (error) {
    console.error('最大化窗口失败:', error);
  }
};
```

### 4. 窗口关闭

**功能**: 关闭应用窗口

**API接口**:
```typescript
// 关闭窗口
window.electronAPI?.close();
```

**使用示例**:
```typescript
// 关闭窗口
const handleClose = () => {
  try {
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    }
  } catch (error) {
    console.error('关闭窗口失败:', error);
  }
};
```

## 主题设置

### 1. 主题切换

**功能**: 在浅色、深色和系统主题之间切换

**API接口**:
```typescript
// 切换主题
toggleTheme(): void
```

**使用示例**:
```typescript
import { useSettings } from '@/hooks/useSettings';

const { toggleTheme, settings } = useSettings();

// 切换主题
const handleToggleTheme = () => {
  toggleTheme();
};

// 检查当前主题
console.log(settings.theme); // 'light' | 'dark' | 'system'
```

### 2. 主题类型

支持的主题类型：
- `'light'`: 浅色主题
- `'dark'`: 深色主题  
- `'system'`: 跟随系统主题
- `'blue'`: 蓝色主题
- `'purple'`: 紫色主题
- `'green'`: 绿色主题
- `'orange'`: 橙色主题
- `'red'`: 红色主题
- `'midnight'`: 午夜蓝主题
- `'coffee'`: 咖啡色主题
- `'custom'`: 自定义主题

## 字体设置

### 1. 字体选择

**功能**: 选择应用使用的字体

**支持字体**:
- System UI
- 思源黑体
- 思源宋体
- 苹方
- 微软雅黑
- Inter
- Source Code Pro

**API接口**:
```typescript
// 更新字体设置
updateSettings({ font: string }): void
```

**使用示例**:
```typescript
import { useSettings } from '@/hooks/useSettings';

const { updateSettings, settings } = useSettings();

// 设置字体
updateSettings({ font: '思源黑体' });

// 检查当前字体
console.log(settings.font);
```

### 2. 字体大小设置

**功能**: 设置应用字体大小（10px - 22px）

**API接口**:
```typescript
// 更新字体大小
updateSettings({ fontSize: number }): void
```

**使用示例**:
```typescript
import { useSettings } from '@/hooks/useSettings';

const { updateSettings, settings } = useSettings();

// 设置字体大小
updateSettings({ fontSize: 16 });

// 检查当前字体大小
console.log(settings.fontSize);
```

## 设置持久化

### 1. 自动保存

所有设置变更都会自动保存到本地存储：

```typescript
// 设置会自动保存
updateSettings({ 
  theme: 'dark',
  font: '思源黑体',
  fontSize: 16,
  alwaysOnTop: true 
});
```

### 2. 设置加载

应用启动时会自动加载保存的设置：

```typescript
// 加载设置
const savedSettings = loadSettings();
console.log(savedSettings);
```

## 错误处理

### 1. 设置验证

```typescript
// 字体大小范围验证
const handleFontSizeChange = (change: number) => {
  const newSize = Math.max(10, Math.min(22, settings.fontSize + change));
  updateSettings({ fontSize: newSize });
};
```

### 2. 错误提示

```typescript
// 设置变更成功提示
if (newSettings.fontSize && newSettings.fontSize !== settings.fontSize) {
  toast({
    title: "字体大小已更改",
    description: `当前大小: ${newSettings.fontSize}px`,
    variant: "success",
  });
}
```

## 注意事项

1. **字体设置稳定性**: 字体大小设置现在在主题切换时会正确保持
2. **设置同步**: 所有设置变更都会立即生效并保存
3. **兼容性**: 支持Windows、macOS和Linux系统
4. **性能**: 字体设置优化后不会影响应用性能 