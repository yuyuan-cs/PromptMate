# **PromptMate 基于 PromptX 项目的升级计划**

**文档版本:** 2.0  
**更新日期:** 2025年9月28日  
**作者:** Sean (deepractice.ai)  

---

## **执行摘要 (Executive Summary)**

本文档提出了将 PromptMate 从传统提示词管理工具升级为基于 PromptX 架构的 **AI 专业能力增强平台** 的完整战略规划。通过整合 PromptX 的 MCP 协议、认知记忆系统和 DPML 标准，PromptMate 将实现从"工具"到"平台"的根本性转变。

### **核心价值主张转变**
- **从** 提示词存储管理 **到** AI 专业角色平台
- **从** 静态模板复用 **到** 动态认知增强  
- **从** 个人效率工具 **到** 企业级 AI 能力中台

---

## **1. 项目背景与机遇分析**

### **1.1 当前 PromptMate 项目现状**

**技术架构现状:**
- 桌面版: Electron + React + TypeScript，功能完善
- 浏览器扩展: Manifest V3 + React，基础功能可用
- 数据存储: 本地 JSON + localStorage，支持导入导出
- 核心功能: 提示词管理、分类、标签、AI 优化、工作流

**产品成熟度:**
- ✅ 完整的 UI 组件库 (Radix UI + Tailwind)
- ✅ 多语言国际化支持 (中英文)
- ✅ AI 集成能力 (OpenAI, Anthropic, 自定义 API)
- ✅ 工作流可视化编辑器
- ✅ 版本管理和评分系统

### **1.2 PromptX 项目核心优势**

**技术创新:**
- **MCP 协议**: 标准化的 AI 能力扩展协议
- **DPML 标准**: 结构化的 AI 角色定义语言
- **认知记忆系统**: recall-remember 循环的智能记忆
- **PATEOAS 架构**: 超媒体驱动的自主决策引擎

**生态价值:**
- 23+ 预置专业角色 (产品经理、架构师、文案等)
- 与 Claude、Cursor 等主流 AI 工具深度集成
- 企业级矛盾分析方法论 (ContradictionManagement)
- 开源社区和标准化推广

核心逻辑: “提示词装配器”（手动与智能）的底层逻辑是完全一致的。

数据结构: 用于存储 角色、技能、记忆 的数据结构（见第4节）是平台无关的，为数据同步奠定基础。

组件库 (可选): 如果使用 React Native / Electron + React 等技术，可以共享大部分 UI 组件。

2.2 浏览器插件版 (Browser Extension)

定位: 轻量级、情境化、即时辅助工具。

技术栈: Manifest V3, React/Vue, TypeScript, Webpack/Vite。

核心特性:

网页注入: 无缝集成到主流 AI 聊天网站。

页面交互: 能够读取选中文本、感知当前页面 URL，实现更智能的上下文推荐。

快速调用: 随时从浏览器工具栏唤出。

2.3 桌面客户端版 (Desktop Client)

定位: 强大的、全局的、离线的知识库与效率中枢。

建议技术栈:

Electron: 成熟稳定，生态丰富，开发速度快，可以将现有 Web 技术栈（React/Vue）几乎无缝迁移。

Tauri: 更现代、轻量、安全的选择。使用 Rust 作为后端，前端依然可以使用 Web 技术，打包体积小，性能更高。

核心特性:

全局快捷键: 无论在任何软件中，都可以通过一个快捷键（如 Ctrl+Shift+P）瞬间唤出 PromptMate。

离线优先: 所有数据本地存储（如 SQLite 数据库），保证离线可用。

系统级集成: 作为菜单栏/系统托盘图标常驻，方便随时访问。

更强的本地能力: 可以直接读取本地文件作为“记忆”组件，未来可作为本地模型（Ollama 等）的管理界面。

3. 功能规划 (Cross-Platform Feature Roadmap)
3.1 V1.0 - 基础功能 (Foundation)

[双平台] 基础的 角色、技能、记忆 组件的增删改查。

[双平台] 一键复制提示词。

[插件] 在特定网页注入快捷按钮。

[桌面] 全局快捷键唤出主窗口。

3.2 V2.0 - 手动提示词装配器 (Standard Mode)

[双平台] 实现完整的“手动装配器”UI 和核心逻辑。用户可以在两个平台上以相同的方式，手动组合和生成提示词。这是必须保持体验一致的核心功能。

3.3 V3.0 - AI 智能装配 (Pro Mode)

[双平台] 实现“AI 智能装配”功能。用户在任一端配置好 API Key 后，应该能在两端都享受到智能推荐和自动装配的能力。

[桌面] 桌面版可以提供更便捷的本地模型（Ollama）API 配置界面。

3.4 平台专属功能规划 (Platform-Specific Features)

浏览器插件:

智能上下文感知: 自动读取当前网页标题或选中文本，作为“核心指令”的默认输入。

表单填充: 对于非聊天类的 AI 工具（如内容生成网站），可以直接将生成的提示词填充到对应的表单中。

桌面客户端:

全局悬浮窗: 除了主窗口，提供一个更迷你的悬浮窗口用于快速查询和复制。

IDE 集成: 开发一个 VS Code 插件，可以直接与 PromptMate 桌面应用通信，在 IDE 中无缝使用提示词库。

多窗口管理: 允许用户同时打开多个装配器窗口，处理不同任务。

4. 数据同步策略 (Data Synchronization Strategy)
这是跨平台产品的核心挑战。

V1 - 手动导入/导出: 提供 JSON 文件的导入导出功能，让用户可以在不同设备间手动迁移数据。

V2 - 浏览器内置同步 (轻量级): 使用 chrome.storage.sync 来同步配置项（如 API Key），但不适合同步整个组件库（有容量限制）。

V3 - 第三方云服务 (终极方案):

集成 Firebase / Supabase 等 BaaS (后端即服务) 平台。

为用户提供一个可选的登录功能。登录后，整个组件库可以在云端实时同步，实现跨设备无缝衔接。

需重点考虑数据加密和用户隐私。

#### **4. 数据结构设计 (Data Structure Design)**

建议在 `chrome.storage.local` 中使用以下 JSON 结构存储数据：

```typescript
// 定义组件的基础结构
interface PromptComponent {
  id: string; // 使用 UUID，确保唯一性
  name: string; // 组件名称，如 "产品经理"
  content: string; // 组件的核心文本内容
  createdAt: string; // 创建时间 ISO 8601
  updatedAt: string; // 更新时间 ISO 8601
}

// 技能组件可以有额外的变量定义
interface Skill extends PromptComponent {
  variables?: string[]; // 例如 ["需求描述", "目标用户"]
}

// 整个存储的状态
interface AppState {
  version: string; // 数据结构的版本号，便于未来迁移
  roles: Role[];
  skills: Skill[];
  memories: Memory[];
  // 其他用户配置
  settings: {
    apiKey?: string; // V3.0 Pro Mode
    apiEndpoint?: string; // V3.0 Pro Mode
  };
}
```

-----

#### **5. 开发与贡献 (Development & Contribution)**

**5.1 环境搭建**

```bash
# 1. 克隆仓库
git clone https://github.com/yy0691/PromptMate.git
cd PromptMate

# 2. 安装依赖
npm install

# 3. 启动开发模式
npm run dev

# 4. 加载插件
# 打开 Chrome/Edge -> 管理扩展 -> 开启开发者模式 -> 加载已解压的扩展 -> 选择 'dist' 文件夹
```

**5.2 贡献指南**

  * **分支管理:**
      * `main`: 生产分支，保持稳定。
      * `develop`: 主要开发分支。
      * 功能开发请从 `develop` 创建新的 `feature/` 分支，例如 `feature/v2-assembler-ui`。
  * **代码风格:** 项目使用 Prettier 和 ESLint 进行代码格式化和检查，请在提交前确保通过检查。
  * **Pull Request:** 完成功能开发后，提交 PR 到 `develop` 分支，并简要描述实现的功能和改动。

-----

**文档结束。** 这份文档为您提供了一个从当前到未来的清晰发展路径。您可以根据这个蓝图，有条不紊地进行功能开发、任务分配，并吸引更多的贡献者加入您的项目。祝 PromptMate 开发顺利！