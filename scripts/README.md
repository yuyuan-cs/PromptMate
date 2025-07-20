# 版本管理脚本

这个脚本用于自动管理PromptMate的版本号，支持语义化版本控制。

## 功能特性

- 🔄 自动更新版本号（major/minor/patch）
- 📅 自动更新构建日期
- 📝 自动更新CHANGELOG.md
- 🏷️ 自动创建Git标签
- 📦 支持一键发布

## 使用方法

### 手动更新版本

```bash
# 补丁版本更新 (1.0.2 -> 1.0.3)
npm run version:patch

# 次版本更新 (1.0.2 -> 1.1.0)
npm run version:minor

# 主版本更新 (1.0.2 -> 2.0.0)
npm run version:major
```

### 一键发布

```bash
# 补丁版本发布（自动更新版本 + 打包）
npm run release:patch

# 次版本发布
npm run release:minor

# 主版本发布
npm run release:major

# 发布Windows版本
npm run release:win

# 发布macOS版本
npm run release:mac

# 发布所有平台版本
npm run release:all
```

### 直接运行脚本

```bash
# 补丁版本
node scripts/version-manager.js patch

# 次版本
node scripts/version-manager.js minor

# 主版本
node scripts/version-manager.js major
```

## 版本类型说明

- **patch**: 补丁版本，修复bug或小改动 (1.0.2 -> 1.0.3)
- **minor**: 次版本，新功能但向后兼容 (1.0.2 -> 1.1.0)
- **major**: 主版本，重大更改或破坏性更新 (1.0.2 -> 2.0.0)

## 自动执行的操作

1. **更新版本号**: 根据类型自动递增package.json中的版本号
2. **更新构建日期**: 设置当前时间作为构建日期
3. **更新CHANGELOG.md**: 在文件开头添加新版本条目
4. **Git操作**: 
   - 添加所有更改到暂存区
   - 提交更改
   - 创建版本标签

## 注意事项

- 确保在运行脚本前已保存所有更改
- 脚本会自动处理Git操作，但可能需要手动处理冲突
- CHANGELOG.md会自动创建（如果不存在）
- 建议在发布前手动检查CHANGELOG.md的内容

## 错误处理

- 如果Git操作失败，脚本会显示警告但不会中断
- 如果文件读写失败，脚本会显示错误并退出
- 所有操作都有详细的日志输出

## 示例输出

```bash
🔄 开始版本更新...

📦 当前版本: 1.0.2
🚀 新版本: 1.0.3
📅 构建日期: 2024-12-19T10:30:00.000Z
✅ package.json已更新
📝 CHANGELOG.md已更新
🏷️  Git标签 v1.0.3 已创建

✅ 版本更新完成!
📋 新版本: 1.0.3
📦 类型: 补丁更新
``` 