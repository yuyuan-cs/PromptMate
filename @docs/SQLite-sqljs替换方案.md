# SQLite sql.js 替换方案说明

## 问题背景

原项目使用 `better-sqlite3` 作为 SQLite 数据库引擎，但在开发环境中遇到了原生模块 ABI 兼容性问题：

```
Error: The module 'better_sqlite3.node' was compiled against a different Node.js version
NODE_MODULE_VERSION 127 vs 123
```

## 解决方案：使用 sql.js

### 什么是 sql.js

`sql.js` 是官方 SQLite 项目编译到 WebAssembly 的版本，具有以下优势：

- ✅ **零编译**：纯 JavaScript，无需原生编译
- ✅ **完美兼容**：无 ABI 版本问题
- ✅ **跨平台**：可在 Node.js、Electron、浏览器中运行
- ✅ **功能完整**：支持完整的 SQLite 功能
- ✅ **性能优异**：WebAssembly 接近原生性能

### 实施步骤

#### 1. 包管理
```bash
# 移除问题包
npm uninstall better-sqlite3

# 安装 WebAssembly 方案
npm install sql.js @types/sql.js
```

#### 2. 创建新的数据库服务

**文件**: `src/main/database-sqljs.cjs`

核心特性：
- 使用 `initSqlJs()` 初始化 WebAssembly 引擎
- 支持文件持久化（自动保存到 `userData/promptmate.db`）
- 完全兼容原有 API 接口
- 事务安全和错误处理

#### 3. 更新主进程

**文件**: `src/main/main.cjs`

```javascript
// 替换导入
const { DatabaseServiceSqlJs } = require('./database-sqljs.cjs');

// 使用新服务
databaseService = new DatabaseServiceSqlJs();
```

#### 4. 更新构建配置

**文件**: `vite.config.ts`

移除 `better-sqlite3` 的外部依赖配置，因为 sql.js 可以在渲染进程中使用。

#### 5. 清理旧文件

删除包含 `better-sqlite3` 引用的旧文件：
- `src/main/database.cjs`
- `dist-electron/main/database.cjs`

### API 兼容性

新的 `DatabaseServiceSqlJs` 完全兼容原有 API：

```javascript
// 所有原有方法都保持不变
databaseService.getAllPrompts()
databaseService.createPrompt(prompt)
databaseService.getAllCategories()
// ... 等等
```

### 数据迁移

数据迁移过程保持不变：
1. 检测现有 localStorage 数据
2. 自动迁移到 SQLite
3. 双重备份策略

### 性能对比

| 特性 | sql.js (WebAssembly) | better-sqlite3 (原生) |
|------|---------------------|---------------------|
| **启动速度** | ✅ 快速 | ✅ 快速 |
| **查询性能** | ✅ 接近原生 | ✅ 原生性能 |
| **文件大小** | ~1.6MB (WASM) | ~数百KB |
| **内存使用** | 适中 | 较低 |
| **兼容性** | ✅ 完美 | ❌ ABI 问题 |

### 验证成功

应用启动后应看到：

**主进程日志**：
```
正在初始化 sql.js SQLite 数据库...
sql.js SQLite 数据库路径: C:\Users\...\promptmate.db
数据库 schema 执行成功
sql.js SQLite 数据库初始化成功
应用启动：SQLite数据库模式 (sql.js)
```

**渲染进程日志**：
```
开始初始化数据库...
数据库状态: { initialized: true, available: true, fallbackMode: false }
从数据库加载了 X 个提示词和 Y 个分类
```

## 总结

通过替换为 sql.js，我们彻底解决了：
- ✅ 原生模块编译问题
- ✅ ABI 版本兼容性问题
- ✅ 开发环境部署复杂性
- ✅ 跨平台兼容性问题

同时保持了：
- ✅ 完整的 SQLite 功能
- ✅ 优秀的性能表现
- ✅ 原有 API 兼容性
- ✅ 数据迁移能力

这是一个更可靠、更易维护的解决方案。
