# PromptMate

PromptMate是一款轻量级桌面应用程序，用于存放和管理用户常用的Prompts。应用采用现代化的设计风格，支持多主题和多字体设置，提供流畅的用户体验。

## 主要特性

1. **提示词管理**
   - 支持创建、编辑、删除和我的收藏
   - 支持按分类和标签组织提示词
   - 提供快速搜索和筛选功能
   - 支持推荐模板系统

2. **界面定制**
   - 支持深色/浅色主题切换
   - 可自定义字体和字号
   - 支持侧边栏宽度调整和折叠
   - 响应式布局设计

3. **数据管理**
   - 本地数据存储
   - 支持数据导入导出
   - 支持数据备份与恢复

## 目录结构

```
PromptMate/
├── doc/ # 文档目录
│ ├── README.md # 项目说明文档
│ └── 开发进度.md # 开发进度文档
├── src/ # 源代码目录
│ ├── components/ # 组件目录
│ │ ├── ui/ # UI组件
│ │ ├── PromptList.tsx # 提示词列表组件
│ │ ├── Sidebar.tsx # 侧边栏组件
│ │ └── ...
│ ├── hooks/ # 自定义Hook
│ │ ├── usePrompts.tsx # 提示词管理Hook
│ │ ├── useSettings.tsx # 设置管理Hook
│ │ └── ...
│ ├── types/ # 类型定义
│ ├── lib/ # 工具函数
│ ├── styles/ # 样式文件
│ └── pages/ # 页面组件
├── public/ # 静态资源
└── package.json # 项目配置文件
```


## 技术栈

- **框架**: React + TypeScript
- **UI组件**: shadcn/ui
- **状态管理**: React Hooks
- **样式**: Tailwind CSS
- **构建工具**: Vite

## 开发环境

- Node.js 16.0+
- npm 7.0+
- TypeScript 4.0+

## 启动命令

```bash
# 安装依赖
npm install

# 开发模式启动
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 贡献指南

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

[MIT](LICENSE)