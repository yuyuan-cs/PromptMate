# PromptMate 发布指南

本指南介绍如何自动更新版本、打包并发布至GitHub Release。

## 发布方式

### 1. 简化发布（最推荐）

跳过本地构建，直接推送代码和标签，让GitHub Actions自动构建和发布。

```bash
# 补丁版本简化发布
npm run simple:patch

# 次版本简化发布
npm run simple:minor

# 主版本简化发布
npm run simple:major
```

**流程说明：**
1. 自动更新版本号
2. 自动更新CHANGELOG.md
3. 自动提交代码和创建Git标签
4. 推送代码和标签到GitHub
5. GitHub Actions自动构建并创建Release

### 2. 快速发布

使用GitHub Actions自动构建和发布，需要本地构建。

```bash
# 补丁版本快速发布
npm run quick:patch

# 次版本快速发布
npm run quick:minor

# 主版本快速发布
npm run quick:major

# 指定平台快速发布
npm run quick:win    # 仅Windows
npm run quick:mac    # 仅macOS
npm run quick:all    # 全平台
```

**流程说明：**
1. 自动更新版本号
2. 自动更新CHANGELOG.md
3. 自动构建应用
4. 自动提交代码和创建Git标签
5. 推送代码和标签到GitHub
6. GitHub Actions自动构建并创建Release

### 3. 本地发布

使用本地脚本直接发布到GitHub Release（需要GitHub Token）。

```bash
# 设置GitHub Token
export GITHUB_TOKEN=your_github_token

# 补丁版本发布
npm run publish:patch

# 次版本发布
npm run publish:minor

# 主版本发布
npm run publish:major

# 指定平台发布
npm run publish:win    # 仅Windows
npm run publish:mac    # 仅macOS
npm run publish:all    # 全平台
```

**流程说明：**
1. 自动更新版本号
2. 自动更新CHANGELOG.md
3. 自动构建应用
4. 自动创建GitHub Release
5. 自动上传构建产物
6. 推送Git标签

## 版本类型说明

- **patch**: 补丁版本，修复bug或小改动 (1.0.3 -> 1.0.4)
- **minor**: 次版本，新功能但向后兼容 (1.0.3 -> 1.1.0)
- **major**: 主版本，重大更改或破坏性更新 (1.0.3 -> 2.0.0)

## 环境要求

### 快速发布
- Git仓库
- Node.js 18+
- npm
- GitHub仓库访问权限

### 本地发布
- Git仓库
- Node.js 18+
- npm
- GitHub Token（需要repo权限）

## GitHub Token设置

### 1. 创建Token
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择 "repo" 权限
4. 复制生成的token

### 2. 设置环境变量

**Windows:**
```cmd
set GITHUB_TOKEN=your_github_token
```

**macOS/Linux:**
```bash
export GITHUB_TOKEN=your_github_token
```

**永久设置（推荐）：**
```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
echo 'export GITHUB_TOKEN=your_github_token' >> ~/.bashrc
source ~/.bashrc
```

## 发布流程详解

### 快速发布流程

```bash
# 1. 开发完成后，准备发布补丁版本
npm run quick:patch

# 输出示例：
🔄 开始版本更新...

📦 当前版本: 1.0.3
🚀 新版本: 1.0.4
📅 构建日期: 2024-12-19T10:30:00.000Z
✅ package.json已更新
📝 CHANGELOG.md已更新
🏷️  Git标签 v1.0.4 已创建

✅ 版本更新完成!
📋 新版本: 1.0.4
📦 类型: 补丁更新

🔍 检查发布环境...
✅ 环境检查通过
🔨 开始构建应用 (all)...
✅ 应用构建完成
🚀 推送代码和标签到GitHub...
✅ 代码推送成功
✅ 标签推送成功

🎉 快速发布完成!
📋 版本: 1.0.4
📦 平台: all
⏱️  等待GitHub Actions自动构建和发布...
```

### 本地发布流程

```bash
# 1. 设置GitHub Token
export GITHUB_TOKEN=your_github_token

# 2. 发布补丁版本
npm run publish:patch

# 输出示例：
🔄 开始版本更新...
📦 当前版本: 1.0.4
🚀 新版本: 1.0.5
📅 构建日期: 2024-12-19T10:35:00.000Z
✅ package.json已更新
📝 CHANGELOG.md已更新
🏷️  Git标签 v1.0.5 已创建

✅ 版本更新完成!
📋 新版本: 1.0.5
📦 类型: 补丁更新

🔍 检查发布环境...
✅ 环境检查通过
🔨 开始构建应用 (all)...
✅ 应用构建完成
📦 找到 6 个构建产物:
   - PromptMate-1.0.5-x64.exe (45.2 MB)
   - PromptMate-1.0.5-x64.zip (45.1 MB)
   - PromptMate-1.0.5-arm64.dmg (52.3 MB)
   - PromptMate-1.0.5-x64.dmg (52.1 MB)
   - PromptMate-1.0.5-arm64.zip (52.2 MB)
   - PromptMate-1.0.5-x64.zip (52.0 MB)
🚀 创建GitHub Release...
✅ GitHub Release创建成功: https://github.com/yy0691/PromptMate/releases/tag/v1.0.5
📤 上传构建产物...
✅ 上传成功: PromptMate-1.0.5-x64.exe
✅ 上传成功: PromptMate-1.0.5-x64.zip
✅ 上传成功: PromptMate-1.0.5-arm64.dmg
✅ 上传成功: PromptMate-1.0.5-x64.dmg
✅ 上传成功: PromptMate-1.0.5-arm64.zip
✅ 上传成功: PromptMate-1.0.5-x64.zip
🏷️  推送Git标签...
✅ Git标签推送成功

🎉 发布完成!
📋 版本: 1.0.5
🌐 Release页面: https://github.com/yy0691/PromptMate/releases/tag/v1.0.5
📦 构建产物: 6 个文件
```

## 故障排除

### 常见问题

1. **GitHub Token错误**
   ```
   ❌ 未设置GITHUB_TOKEN环境变量
   ```
   解决：设置正确的GitHub Token

2. **构建失败**
   ```
   ❌ 构建失败: Command failed
   ```
   解决：检查依赖安装和构建环境

3. **Git操作失败**
   ```
   ❌ Git标签推送失败
   ```
   解决：检查Git配置和网络连接

4. **文件上传失败**
   ```
   ❌ 上传失败: GitHub API错误
   ```
   解决：检查GitHub Token权限和网络连接

### 调试模式

```bash
# 启用详细日志
DEBUG=* npm run quick:patch

# 或直接运行脚本
node scripts/quick-release.js patch
```

## 最佳实践

1. **版本管理**
   - 使用语义化版本控制
   - 及时更新CHANGELOG.md
   - 为每个版本创建Git标签

2. **发布流程**
   - 开发完成后先测试
   - 使用快速发布（推荐）
   - 检查Release页面确认发布成功

3. **安全考虑**
   - 不要在代码中硬编码GitHub Token
   - 使用环境变量管理敏感信息
   - 定期更新GitHub Token

4. **自动化**
   - 利用GitHub Actions实现CI/CD
   - 自动化测试和构建
   - 自动化发布流程

## 相关文件

- `scripts/version-manager.js` - 版本管理脚本
- `scripts/release-manager.js` - 本地发布脚本
- `scripts/quick-release.js` - 快速发布脚本
- `.github/workflows/release.yml` - GitHub Actions工作流
- `CHANGELOG.md` - 更新日志
- `package.json` - 项目配置和脚本 