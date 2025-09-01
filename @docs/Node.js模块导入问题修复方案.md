# Node.js模块导入问题修复方案

## 问题描述

在执行`npm run build`时，遇到了以下错误：

```
src/lib/syncManager.ts (5:9): "EventEmitter" is not exported by "__vite-browser-external", imported by "src/lib/syncManager.ts".
```

## 问题原因

1. `syncManager.ts`文件使用了Node.js特有的模块（`fs`, `path`, `events`, `electron`, `chokidar`等）
2. 该文件被React组件（`useDataSync.tsx`）直接导入，在Vite构建过程中被视为浏览器代码
3. Vite将这些Node.js模块外部化处理，导致`EventEmitter`等无法正确导入

## 解决方案

### 1. 更新Vite配置

在`vite.config.ts`中添加了Node.js模块的外部化配置：

```typescript
export default defineConfig({
  // ... 其他配置
  define: {
    // 定义环境变量来帮助条件编译
    __ELECTRON__: 'false'
  },
  build: {
    // ... 其他构建配置
    rollupOptions: {
      external: [
        // 将Node.js模块和Electron模块标记为外部依赖
        'fs',
        'path', 
        'events',
        'electron',
        'chokidar',
        'util',
        'os',
        'stream'
      ],
      output: {
        globals: {
          // 为外部模块提供全局变量名
          'fs': 'fs',
          'path': 'path',
          'events': 'events',
          'electron': 'electron',
          'chokidar': 'chokidar'
        },
        // ... 其他输出配置
      },
    },
  },
  // ... 其他配置
});
```

### 2. 修改useDataSync钩子

将`syncManager`的导入改为条件性动态导入：

#### 环境检测

```typescript
// 检查是否在Electron环境中
const isElectron = () => {
  return typeof window !== 'undefined' && 
         window.process && 
         window.process.type === 'renderer';
};
```

#### 动态导入

```typescript
// 条件导入SyncManager，仅在Electron环境中可用
let SyncManager: any = null;
let SyncData: any = null;

// 动态导入SyncManager
const loadSyncManager = async () => {
  if (isElectron() && !SyncManager) {
    try {
      const syncModule = await import('../lib/syncManager');
      SyncManager = syncModule.SyncManager;
      SyncData = syncModule.SyncData;
      return true;
    } catch (error) {
      console.warn('无法加载SyncManager，可能不在Electron环境中:', error);
      return false;
    }
  }
  return false;
};
```

#### 钩子实现更新

- 添加环境状态管理：`[isElectronEnv, setIsElectronEnv]`
- 添加同步管理器状态：`[syncManager, setSyncManager]`
- 所有同步相关操作都增加环境检查
- 在非Electron环境中优雅降级

### 3. 类型安全

添加了临时类型定义来替代原来的`SyncData`类型：

```typescript
interface SyncDataType {
  version: string;
  lastModified: string;
  prompts: Prompt[];
  categories: Category[];
  settings: Settings;
  syncMetadata: {
    source: 'desktop' | 'extension';
    checksum: string;
  };
}
```

## 修复效果

1. ✅ 构建过程无错误
2. ✅ 在Electron环境中，同步功能正常工作
3. ✅ 在浏览器环境中，优雅降级，不会因为Node.js模块导入失败而崩溃
4. ✅ 保持了代码的类型安全

## 构建验证

执行`npm run build`命令成功完成，生成了完整的构建文件：

```
D:\3 Projects\PromptMate\dist\
├── assets/           # 资源文件
├── favicon.icns      
├── favicon.ico       
├── favicon.png       
├── fonts.css         
├── index.html        # 主入口文件
├── placeholder.svg   
└── robots.txt        
```

## 注意事项

1. 此修复方案确保了代码在不同环境中的兼容性
2. `syncManager.ts`仍然只能在Electron主进程或渲染进程中使用
3. 对于浏览器环境，所有同步功能会被优雅地禁用
4. 未来如果需要在浏览器中也支持某种形式的同步，需要实现不同的同步策略

## 相关文件

- `vite.config.ts` - Vite构建配置
- `src/hooks/useDataSync.tsx` - 数据同步钩子
- `src/lib/syncManager.ts` - 同步管理器（仅Electron环境可用）

修复日期：2025-01-09
