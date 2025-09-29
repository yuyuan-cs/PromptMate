I'll help you write comprehensive development requirements for enhancing the workflow-based prompt management functionality. Let me first examine the existing workflow components to understand the current implementation.

Based on my analysis of the existing workflow components, I'll write comprehensive development requirements for enhancing the workflow-based prompt management functionality with a visual canvas interface.
# PromptMate 工作流管理功能开发需求文档

## 1. 项目概述

### 1.1 背景
PromptMate 当前已具备基础的工作流管理功能，包括工作流的创建、编辑、执行等核心能力。为了提升用户体验和工作效率，需要完善工作流的可视化管理功能，特别是通过画布界面来直观地管理各个节点的提示词。

### 1.2 目标
- 提供直观的可视化工作流编辑器
- 支持拖拽式节点管理
- 增强提示词节点的管理能力
- 提升工作流的可读性和可维护性

## 2. 功能需求

### 2.1 可视化画布编辑器

#### 2.1.1 画布基础功能
- **画布区域**：提供无限滚动的画布空间
- **缩放控制**：支持画布缩放（25%-200%）
- **平移操作**：支持鼠标拖拽平移画布
- **网格背景**：可选的网格背景辅助对齐
- **小地图**：显示整个工作流的缩略图导航

#### 2.1.2 节点管理
- **节点类型**：
  - 开始节点（Start Node）
  - 提示词节点（Prompt Node）
  - 条件判断节点（Condition Node）
  - 结束节点（End Node）
  - 变量设置节点（Variable Node）
  - 输出节点（Output Node）

- **节点操作**：
  - 从工具栏拖拽创建新节点
  - 双击节点进行编辑
  - 右键菜单：复制、删除、重命名
  - 多选节点进行批量操作
  - 节点分组管理

#### 2.1.3 连接线管理
- **连接创建**：拖拽节点端口创建连接
- **连接样式**：支持直线、曲线、折线等样式
- **条件连接**：支持带条件的连接线（成功/失败/条件）
- **连接编辑**：双击连接线编辑条件
- **自动布局**：智能避免连接线交叉

### 2.2 提示词节点增强

#### 2.2.1 节点内容管理
- **提示词选择**：
  - 从现有提示词库选择
  - 创建新的内联提示词
  - 支持提示词预览和编辑
  - 提示词版本管理

- **变量绑定**：
  - 可视化变量输入/输出端口
  - 变量类型标识（文本、数字、文件等）
  - 变量映射关系图
  - 自动变量依赖检测

#### 2.2.2 节点配置面板
- **基础信息**：节点名称、描述、标签
- **执行设置**：超时时间、重试次数、并行度
- **条件设置**：执行条件、跳过条件
- **输出配置**：输出变量名、格式化规则

### 2.3 工作流模板系统

#### 2.3.1 模板管理
- **内置模板**：
  - 文章写作流程
  - 代码生成流程
  - 数据分析流程
  - 创意设计流程
  - 学习辅助流程

- **自定义模板**：
  - 将现有工作流保存为模板
  - 模板分类和标签管理
  - 模板分享和导入
  - 模板版本控制

#### 2.3.2 快速创建
- **模板预览**：可视化模板结构预览
- **一键创建**：基于模板快速创建工作流
- **参数化模板**：支持模板参数自定义

### 2.4 执行监控与调试

#### 2.4.1 实时监控
- **执行状态**：节点执行状态实时显示
- **进度指示**：整体执行进度条
- **日志查看**：详细的执行日志
- **性能监控**：执行时间、资源消耗统计

#### 2.4.2 调试功能
- **断点设置**：在特定节点设置断点
- **单步执行**：逐步执行工作流
- **变量查看**：实时查看变量值变化
- **错误定位**：快速定位执行错误

## 3. 技术实现方案

### 3.1 前端技术栈
- **画布引擎**：React Flow 或 Konva.js
- **状态管理**：基于现有的 React Context
- **UI组件**：继续使用 Radix UI + Tailwind CSS
- **拖拽功能**：React DnD 或原生 HTML5 拖拽

### 3.2 数据结构扩展

```typescript
// 扩展现有的 WorkflowStep 接口
interface VisualWorkflowStep extends WorkflowStep {
  // 画布位置信息
  position: {
    x: number;
    y: number;
  };
  // 节点尺寸
  size: {
    width: number;
    height: number;
  };
  // 节点类型
  nodeType: 'start' | 'prompt' | 'condition' | 'end' | 'variable' | 'output';
  // 端口配置
  ports: {
    input: Port[];
    output: Port[];
  };
  // 样式配置
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };
}

// 连接线接口
interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  condition?: WorkflowCondition;
  style?: ConnectionStyle;
}

// 画布视图状态
interface CanvasViewState {
  zoom: number;
  pan: { x: number; y: number };
  selectedNodes: string[];
  selectedConnections: string[];
}
```

### 3.3 组件架构

```
WorkflowCanvas/
├── Canvas/                 # 画布容器
│   ├── CanvasContainer.tsx
│   ├── CanvasBackground.tsx
│   └── CanvasMinimap.tsx
├── Nodes/                  # 节点组件
│   ├── BaseNode.tsx
│   ├── PromptNode.tsx
│   ├── ConditionNode.tsx
│   └── OutputNode.tsx
├── Connections/            # 连接线组件
│   ├── Connection.tsx
│   └── ConnectionHandle.tsx
├── Toolbar/               # 工具栏
│   ├── NodeToolbar.tsx
│   └── CanvasToolbar.tsx
├── Panels/                # 配置面板
│   ├── NodeConfigPanel.tsx
│   └── WorkflowConfigPanel.tsx
└── Utils/                 # 工具函数
    ├── layoutUtils.ts
    └── validationUtils.ts
```

## 4. 用户界面设计

### 4.1 布局结构
```
┌─────────────────────────────────────────────────────────┐
│ 工作流标题栏 [保存] [执行] [设置]                          │
├─────────────────────────────────────────────────────────┤
│ 工具栏: [节点] [连接] [布局] [缩放] [网格]                │
├──────────┬──────────────────────────────┬───────────────┤
│ 节点面板  │        画布区域               │  属性面板      │
│          │                             │              │
│ [开始]   │     ┌─────┐    ┌─────┐      │  节点配置     │
│ [提示词] │     │开始 │────│提示词│      │  ┌─────────┐  │
│ [条件]   │     └─────┘    └─────┘      │  │名称     │  │
│ [输出]   │                             │  │描述     │  │
│ [结束]   │                             │  │变量     │  │
│          │                             │  └─────────┘  │
├──────────┴──────────────────────────────┴───────────────┤
│ 状态栏: 缩放 100% | 节点数: 5 | 连接数: 4 | 执行状态: 就绪 │
└─────────────────────────────────────────────────────────┘
```

### 4.2 交互设计
- **拖拽创建**：从左侧面板拖拽节点到画布
- **连接操作**：拖拽节点端口创建连接
- **选择操作**：框选多个节点，支持批量操作
- **右键菜单**：提供快捷操作菜单
- **键盘快捷键**：Ctrl+C复制、Ctrl+V粘贴、Delete删除等

## 5. 开发计划

### 5.1 第一阶段：基础画布功能（2周）
- [ ] 实现基础画布容器和视图控制
- [ ] 创建基本节点组件和连接线组件
- [ ] 实现节点的创建、移动、删除功能
- [ ] 添加基础的工具栏和属性面板

### 5.2 第二阶段：节点功能增强（2周）
- [ ] 完善提示词节点的配置功能
- [ ] 实现变量端口的可视化管理
- [ ] 添加条件节点和其他特殊节点
- [ ] 完善节点配置面板

### 5.3 第三阶段：执行与调试（1.5周）
- [ ] 集成工作流执行引擎
- [ ] 实现执行状态的可视化显示
- [ ] 添加调试功能和错误处理
- [ ] 完善执行日志和监控

### 5.4 第四阶段：模板与优化（1.5周）
- [ ] 实现工作流模板系统
- [ ] 添加自动布局算法
- [ ] 性能优化和用户体验改进
- [ ] 完善文档和测试

## 6. 验收标准

### 6.1 功能验收
- ✅ 能够通过拖拽方式创建和编辑工作流
- ✅ 支持多种类型的节点和连接方式
- ✅ 提示词节点能够正确管理和执行
- ✅ 工作流能够正常执行并显示状态
- ✅ 支持工作流的保存、加载和模板化

### 6.2 性能验收
- ✅ 支持100+节点的大型工作流
- ✅ 画布操作响应时间 < 100ms
- ✅ 工作流执行性能不低于原有实现

### 6.3 用户体验验收
- ✅ 界面直观易用，学习成本低
- ✅ 操作流程符合用户习惯
- ✅ 错误提示清晰准确
- ✅ 支持撤销/重做操作

这个开发需求文档基于现有的工作流功能架构，重点增强了可视化编辑能力。通过画布界面，用户可以更直观地管理提示词节点和工作流逻辑，大大提升工作效率。