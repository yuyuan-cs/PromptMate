# PromptMate SQLite数据库集成说明

## 📊 项目概述

本文档记录了PromptMate项目中SQLite数据库集成的完整实现过程，该集成旨在替代原有的localStorage存储方案，提供更可靠、高性能的数据持久化解决方案。

## ✅ 已完成的工作

### 1. 数据库架构设计
- **数据库Schema** (`src/lib/database/schema.sql`)
  - 设计了完整的关系型数据库结构
  - 包含提示词、分类、标签、图片、设置等核心表
  - 添加了外键约束、索引和触发器
  - 支持自动时间戳更新

### 2. 数据访问层(DAO)实现
- **BaseDAO** (`src/lib/database/dao/BaseDAO.ts`)
  - 提供统一的数据库访问基类
  - 包含事务处理和错误处理机制
  
- **PromptDAO** (`src/lib/database/dao/PromptDAO.ts`)
  - 提示词的CRUD操作
  - 支持标签和图片的关联管理
  - 提供复杂查询和过滤功能
  
- **CategoryDAO** (`src/lib/database/dao/CategoryDAO.ts`)
  - 分类管理操作
  - 使用状态检查功能
  
- **TagDAO** (`src/lib/database/dao/TagDAO.ts`)
  - 标签管理和统计
  - 支持按分类筛选标签
  
- **SettingsDAO** (`src/lib/database/dao/SettingsDAO.ts`)
  - 应用设置的键值对存储
  - 支持类型化的数据存取

### 3. 数据库管理器
- **DatabaseManager** (`src/lib/database/database.ts`)
  - 单例模式的数据库连接管理
  - 自动读取并执行schema.sql
  - WAL模式优化性能
  - 备份功能支持

### 4. 数据迁移系统
- **MigrationManager** (`src/lib/database/migration/migrationManager.ts`)
  - 从localStorage无缝迁移到SQLite
  - 完整的数据备份机制
  - 迁移状态跟踪和验证
  - 支持回滚操作

### 5. 应用层集成
- **usePrompts Hook** (`src/hooks/usePrompts.tsx`)
  - 更新为支持SQLite和localStorage双模式
  - 自动回退机制确保向后兼容
  - 双重备份策略保证数据安全
  - 统一的API接口，现有组件无需修改

### 6. Electron主进程集成
- **main.cjs** (`src/main/main.cjs`)
  - 添加数据库初始化逻辑
  - 提供数据库状态查询IPC接口
  - 启动时自动初始化数据库

## 🚀 核心特性

### 1. 智能回退机制
```typescript
// 如果SQLite初始化失败，自动回退到localStorage
if (dbState.useSqlite && promptDAO) {
  // 使用SQLite数据库
  const savedPrompt = promptDAO.create(newPrompt);
} else {
  // 使用localStorage
  const updatedPrompts = [newPrompt, ...prompts];
  savePrompts(updatedPrompts);
}
```

### 2. 双重备份策略
- SQLite作为主要存储
- localStorage作为实时备份
- 数据迁移前自动创建文件备份

### 3. 事务安全
```typescript
const transaction = this.db.transaction(() => {
  // 原子操作，确保数据一致性
  insertPrompt.run(/* ... */);
  insertTags(promptId, tags);
  insertImages(promptId, images);
});
transaction();
```

### 4. 向后兼容
- 现有组件无需任何修改
- API接口保持完全一致
- 自动数据迁移，用户无感知

## 📁 文件结构

```
src/
├── lib/
│   └── database/
│       ├── database.ts              # 数据库管理器
│       ├── schema.sql               # 数据库结构
│       ├── dao/                     # 数据访问对象
│       │   ├── BaseDAO.ts
│       │   ├── PromptDAO.ts
│       │   ├── CategoryDAO.ts
│       │   ├── TagDAO.ts
│       │   └── SettingsDAO.ts
│       └── migration/               # 数据迁移
│           └── migrationManager.ts
└── hooks/
    └── usePrompts.tsx               # 更新的数据管理Hook
```

## 🔧 使用方式

### 开发环境测试
```bash
# 安装依赖
npm install better-sqlite3 @types/better-sqlite3

# 启动应用
npm run electron:dev
```

### 数据库状态检查
```typescript
const { getDatabaseInfo } = usePrompts();
const dbInfo = getDatabaseInfo();

console.log('数据库状态:', dbInfo);
// {
//   isInitialized: true,
//   isConnected: true, 
//   useSqlite: true,
//   promptCount: 150,
//   categoryCount: 8,
//   tagCount: 45
// }
```

### 迁移管理
```typescript
const migrationManager = new MigrationManager();

// 获取迁移信息
const info = migrationManager.getMigrationInfo();

// 回滚迁移（如果需要）
await migrationManager.rollbackMigration();
```

## 📊 性能优化

### 1. 数据库优化
- 启用WAL模式提高并发性能
- 添加适当索引加速查询
- 使用事务批量操作

### 2. 查询优化
- JOIN查询合并标签和图片数据
- 使用预编译语句提高执行效率
- 分页和限制结果集大小

### 3. 内存管理
- 单例模式避免多实例
- 及时关闭数据库连接
- 合理的缓存策略

## 🛡️ 错误处理

### 1. 初始化失败处理
```typescript
try {
  await dbManager.init();
  // SQLite模式
} catch (error) {
  console.log('回退到localStorage模式');
  // 自动回退，应用正常运行
}
```

### 2. 操作失败处理
```typescript
try {
  return promptDAO.create(prompt);
} catch (error) {
  // 如果数据库操作失败，回退到localStorage
  const updatedPrompts = [prompt, ...prompts];
  savePrompts(updatedPrompts);
}
```

### 3. 数据一致性保证
- 事务回滚机制
- 双重备份验证
- 定期数据校验

## 🔄 迁移流程

1. **备份阶段**：创建localStorage数据的完整备份
2. **迁移阶段**：将数据逐步迁移到SQLite表中
3. **验证阶段**：检查迁移数据的完整性和正确性
4. **标记阶段**：设置迁移完成标记，避免重复迁移

## 📈 监控和日志

### 数据库操作日志
```typescript
console.log('从数据库加载了 X 个提示词和 Y 个分类');
console.log('提示词已保存到数据库: promptId');
console.warn('数据库操作失败，回退到localStorage');
```

### 性能监控
- 查询执行时间跟踪
- 内存使用监控
- 错误率统计

## 🎯 后续计划

### 即将完成
- [ ] 完整的集成测试
- [ ] 性能基准测试
- [ ] 用户手册更新

### 未来增强
- [ ] 数据压缩和归档
- [ ] 增量备份功能
- [ ] 云同步集成
- [ ] 数据分析和统计

## 📝 注意事项

1. **环境依赖**：SQLite仅在Electron环境中可用
2. **数据兼容**：保持与原localStorage格式的兼容性
3. **错误恢复**：确保任何错误都不会影响应用的正常使用
4. **性能考量**：大量数据时优先使用SQLite，小量数据时localStorage也足够

## 🔗 相关文档

- [数据库Schema设计](./schema.sql)
- [API文档](../doc/API文档.md)
- [开发文档](../doc/开发文档.md)

---

*最后更新: 2024年1月*
*作者: PromptMate开发团队*
