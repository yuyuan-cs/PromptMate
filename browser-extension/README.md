# PromptMate 浏览器扩展

PromptMate 浏览器扩展是 PromptMate 桌面应用的配套工具，让您能够在任何网页中快速使用您的提示词库。

## 🎯 功能特性

- **📋 工具栏访问**: 点击浏览器工具栏图标快速打开提示词库
- **🖱️ 右键菜单**: 右键点击任何地方访问PromptMate功能  
- **⌨️ 快捷键支持**: 默认 `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`) 快速唤出
- **🎯 智能注入**: 自动检测输入框并插入提示词内容
- **⚙️ 设置页面**: 自定义快捷键和扩展行为

## 📦 安装方法

### 方法一：从源代码安装（推荐）

1. **克隆或下载项目**
   ```bash
   git clone https://github.com/yy0691/PromptMate.git
   cd PromptMate/browser-extension
   ```

2. **安装依赖并构建**
   ```bash
   npm install
   npm run build
   ```

3. **在Chrome中加载扩展**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `browser-extension/dist` 文件夹

### 方法二：从预构建包安装

1. **下载预构建包**
   - 下载 `promptmate-extension.zip` 文件
   - 解压到本地文件夹

2. **在Chrome中加载**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择解压后的文件夹

## 🚀 使用方法

### 基本操作

1. **工具栏图标**: 点击浏览器工具栏的 PromptMate 图标
2. **快捷键**: 按 `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`)
3. **右键菜单**: 在任何网页右键点击，选择"PromptMate"

### 在输入框中使用

1. 点击任何文本输入框（如搜索框、评论框等）
2. 使用上述任一方式打开 PromptMate
3. 选择您需要的提示词
4. 点击"插入"按钮，内容将自动填充到输入框

### 设置配置

1. 点击扩展图标，然后点击设置图标
2. 或者访问 `chrome://extensions/`，找到 PromptMate，点击"选项"
3. 在设置页面中可以：
   - 自定义快捷键
   - 配置扩展行为
   - 管理网站黑白名单

## 🛠️ 开发说明

### 项目结构

```
browser-extension/
├── src/
│   ├── popup/          # 主弹窗界面
│   ├── options/        # 设置页面
│   ├── background/     # 背景脚本
│   ├── content/        # 内容脚本
│   ├── shared/         # 共享类型和工具
│   └── assets/         # 静态资源
├── public/             # 公共文件
├── dist/               # 构建输出
├── manifest.json       # 扩展配置
└── webpack.config.js   # 构建配置
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式构建（监听文件变化）
npm run dev

# 生产模式构建
npm run build

# 打包成zip文件
npm run pack

# 自动化发布（推荐）
npm run release          # 修复版本 (1.0.0 -> 1.0.1)
npm run release:minor    # 小版本 (1.0.0 -> 1.1.0)
npm run release:major    # 大版本 (1.0.0 -> 2.0.0)

# 类型检查
npm run type-check

# 代码规范检查
npm run lint
```

### 技术栈

- **React 18**: UI框架
- **TypeScript**: 类型安全
- **Webpack 5**: 构建工具
- **Chrome Extension APIs**: 浏览器集成
- **Manifest V3**: 最新扩展标准

## 🔧 高级配置

### 自定义快捷键

1. 在 Chrome 地址栏输入 `chrome://extensions/shortcuts`
2. 找到 PromptMate 扩展
3. 设置您偏好的快捷键组合

### 网站兼容性

扩展已针对以下网站进行优化：
- **社交媒体**: Twitter/X, LinkedIn, Facebook
- **邮件服务**: Gmail, Outlook
- **AI平台**: ChatGPT, Claude, Gemini
- **文档工具**: Notion, Google Docs
- **通用输入框**: 适配所有标准HTML输入元素

## 🐛 故障排除

### 扩展无法加载
- 确保已启用开发者模式
- 检查 `dist` 文件夹是否存在且包含所有必要文件
- 尝试重新构建项目

### 快捷键不工作
- 检查是否与其他扩展冲突
- 在 `chrome://extensions/shortcuts` 中重新设置

### 内容注入失败
- 某些网站可能有安全限制
- 尝试刷新页面后再使用
- 检查浏览器控制台是否有错误信息

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请访问 [GitHub Issues](https://github.com/yy0691/PromptMate/issues)

---

**注意**: 这是 PromptMate v1.0 的演示版本，完整功能正在开发中。


