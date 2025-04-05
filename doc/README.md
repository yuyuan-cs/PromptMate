# PromptMate

PromptMate是一款轻量级桌面应用程序，用于存放和管理用户常用的Prompts，同时预置一组常用Prompts。应用界面追求苹果风格，支持多主题和多字体设置，确保在Windows系统下具有优异的显示效果，并具备全局快捷键唤出及窗口置顶功能。

## 目录结构

```
PromptMate/
├── doc/                    # 文档目录
│   ├── README.md           # 项目说明文档
│   ├── 开发进度.md          # 开发进度文档
│   ├── API文档.md           # API接口文档
│   ├── 数据字典.md          # 数据字典文档
│   └── 开发文档.md          # 项目开发文档
├── src/                    # 源代码目录
│   ├── main/               # 主进程代码
│   │   └── main.cjs         # 主进程入口文件
│   ├── renderer/           # 渲染进程代码
│   │   ├── components/     # 组件目录
│   │   ├── pages/          # 页面目录
│   │   ├── App.js          # 应用主组件
│   │   ├── App.css         # 应用主样式
│   │   ├── index.js        # 渲染进程入口
│   │   ├── index.css       # 全局样式
│   │   └── index.html      # HTML模板
│   ├── assets/             # 资源文件目录
│   │   ├── icons/          # 图标资源
│   │   └── fonts/          # 字体资源
│   └── data/               # 数据目录
│       └── defaultPrompts.json # 默认提示语数据
├── package.json            # 项目配置文件
└── README.md               # 项目根目录说明文件
```

## 技术选型

### 前端技术栈
- **框架**: Electron + React
- **路由**: React Router
- **状态管理**: React Hooks
- **样式**: CSS/SCSS
- **构建工具**: Webpack

### 后端技术栈
- **数据存储**: 本地JSON文件
- **进程通信**: Electron IPC

## 功能特性

1. **Prompts管理**
   - 支持创建、编辑、删除和分类管理Prompts
   - 预置常用Prompts模板
   - 支持标签和分类筛选

2. **主题与字体设置**
   - 多种预设主题（浅色、深色等）
   - 多种字体选项
   - 自定义字体大小

3. **便捷功能**
   - 全局快捷键唤出（默认Ctrl+Alt+P）
   - 窗口置顶功能
   - 快速搜索

4. **数据管理**
   - 本地数据存储
   - 数据导入导出
   - 数据备份与恢复

## 开发环境

- Node.js 14.0+
- npm 6.0+
- Electron 19.0+
- React 18.0+

## 启动命令

```bash
# 安装依赖
npm install

# 开发模式启动
npm start

# 打包应用
npm run build
```

## 贡献指南

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 版本历史

- **v1.0.0** - 初始版本

## 许可证

[ISC](LICENSE) 