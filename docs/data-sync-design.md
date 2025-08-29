# PromptMate 数据同步设计方案

## 概述
实现桌面端与浏览器扩展之间的实时数据同步，确保用户在不同平台上的数据一致性。

## 技术方案：Native Messaging + 文件同步

### 架构图
```
桌面端应用 ←→ 共享数据文件 ←→ Native Host ←→ 浏览器扩展
```

### 核心组件

#### 1. 共享数据文件 (`%APPDATA%/PromptMate/data.json`)
```json
{
  "version": "1.0.0",
  "lastModified": "2024-01-01T00:00:00.000Z",
  "prompts": [...],
  "categories": [...],
  "settings": {...},
  "syncMetadata": {
    "source": "desktop|extension",
    "checksum": "abc123"
  }
}
```

#### 2. Native Host 程序 (`promptmate-sync-host.exe`)
- 监听文件变化
- 处理扩展消息
- 数据冲突解决
- 错误处理和日志

#### 3. 桌面端同步模块
- 文件监听器
- 数据变更检测
- 自动保存机制

#### 4. 扩展端同步模块
- Native Messaging 客户端
- 数据合并逻辑
- 冲突解决策略

## 实现步骤

### Phase 1: 基础架构
1. 创建 Native Host 程序
2. 注册 Chrome Native Messaging
3. 实现基础通信协议

### Phase 2: 数据同步
1. 实现文件监听和读写
2. 添加数据版本控制
3. 实现冲突检测和解决

### Phase 3: 用户体验
1. 添加同步状态指示器
2. 实现手动同步触发
3. 错误处理和用户提示

### Phase 4: 高级功能
1. 增量同步优化
2. 数据备份和恢复
3. 多设备同步支持

## 数据冲突解决策略

### 1. 时间戳优先
- 比较 `lastModified` 时间戳
- 最新修改的数据获胜

### 2. 用户选择
- 检测到冲突时提示用户
- 提供合并、覆盖、保留选项

### 3. 智能合并
- 对于不冲突的数据自动合并
- 仅对冲突项目要求用户决策

## 安全考虑

1. **数据加密**：敏感数据本地加密存储
2. **权限控制**：Native Host 仅允许指定扩展访问
3. **数据校验**：使用校验和防止数据损坏
4. **访问日志**：记录所有数据访问操作

## 用户配置

### 桌面端设置
```typescript
interface SyncSettings {
  enabled: boolean;
  dataPath: string;
  autoSync: boolean;
  conflictResolution: 'timestamp' | 'manual' | 'merge';
  backupEnabled: boolean;
  maxBackups: number;
}
```

### 扩展端设置
```typescript
interface ExtensionSyncSettings {
  enabled: boolean;
  syncInterval: number; // 秒
  showSyncStatus: boolean;
  autoResolveConflicts: boolean;
}
```

## 错误处理

### 常见错误场景
1. Native Host 未安装
2. 数据文件损坏
3. 权限不足
4. 网络问题（云同步）
5. 版本不兼容

### 错误恢复机制
1. 自动重试机制
2. 数据备份恢复
3. 降级到本地模式
4. 用户友好的错误提示

## 性能优化

1. **增量同步**：仅同步变更的数据
2. **数据压缩**：大数据传输时压缩
3. **缓存机制**：避免重复读取文件
4. **异步处理**：不阻塞主线程

## 测试策略

### 单元测试
- 数据序列化/反序列化
- 冲突检测算法
- 文件操作

### 集成测试
- 桌面端与扩展通信
- 数据同步完整流程
- 错误场景处理

### 用户测试
- 同步延迟测试
- 大数据量测试
- 多设备并发测试

## 部署和分发

### Native Host 安装
1. 桌面端安装时自动部署
2. 注册表配置自动写入
3. 扩展首次运行时验证

### 更新机制
1. 版本兼容性检查
2. 自动更新 Native Host
3. 数据迁移脚本

## 监控和诊断

### 同步状态监控
- 实时同步状态显示
- 同步历史记录
- 性能指标统计

### 诊断工具
- 连接测试工具
- 数据完整性检查
- 日志查看器

## 未来扩展

1. **多平台支持**：macOS、Linux
2. **云端同步**：可选的云端备份
3. **团队协作**：共享提示词库
4. **版本历史**：提示词版本管理
