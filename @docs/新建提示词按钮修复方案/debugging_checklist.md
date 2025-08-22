# 提示词新建面板空白页面问题 - 调试清单

## 问题总结
点击"新建"按钮后跳转到空白页面，主要原因是视图渲染逻辑和状态管理存在问题。

## 主要修复点

### 1. 视图渲染逻辑修复
- 将复杂的三元运算符改为 switch-case 结构
- 确保每个视图状态都有对应的渲染逻辑
- 添加错误边界和加载状态

### 2. Props 接口修复  
- 移除不存在的 `isVisible` prop
- 确保 PromptEditView 接收正确的 props
- 添加 categories 数据验证

### 3. 状态管理优化
- 确保状态切换时正确清理旧状态
- 添加状态变更的调试日志
- 改进错误处理逻辑

## 立即修复步骤

### 步骤 1: 替换 sidepanel.tsx 中的主内容渲染逻辑
```typescript
// 替换原有的复杂三元运算符为 switch 结构（见代码示例）
```

### 步骤 2: 修复 PromptEditView 组件初始化
```typescript
// 添加数据验证和调试日志（见代码示例）
```

### 步骤 3: 添加调试信息
在浏览器控制台中检查以下信息：
- `currentView` 状态是否正确切换到 'edit'
- `categories` 数据是否正确加载
- `editingPrompt` 状态是否为 null（新建时）
- 是否有 JavaScript 错误

## 检查要点

### A. 数据完整性
- [ ] `categories` 数组是否已加载且不为空
- [ ] `useExtensionPrompts` hook 是否正常工作
- [ ] 状态管理是否正确初始化

### B. 组件渲染
- [ ] `PromptEditView` 组件是否正确接收 props
- [ ] 表单初始化是否成功
- [ ] CSS 样式是否正确应用

### C. 状态切换
- [ ] 点击新建按钮时 `currentView` 是否变为 'edit'
- [ ] `editingPrompt` 是否正确设置为 null
- [ ] 页面是否正确重新渲染

## 验证修复效果

### 测试步骤
1. 刷新扩展页面
2. 点击"新建"按钮
3. 检查是否显示编辑表单
4. 尝试填写表单内容
5. 测试保存功能

### 预期结果
- ✅ 显示完整的编辑表单
- ✅ 所有表单字段可正常输入
- ✅ 分类下拉菜单正常显示
- ✅ 保存/取消按钮正常工作

## 常见问题排查

### 如果仍然出现空白页面
1. **检查控制台错误**: 打开 DevTools 查看是否有 JavaScript 错误
2. **验证数据加载**: 确认 `useExtensionPrompts` 返回的数据完整
3. **检查CSS**: 确认组件没有被 CSS 隐藏（如 `display: none`）
4. **React 渲染**: 检查是否有无限重渲染问题

### 如果表单显示但功能异常
1. **Props 传递**: 确认所有必需的 props 都正确传递
2. **事件处理**: 检查按钮点击事件是否正确绑定
3. **状态更新**: 验证表单状态更新是否正常

## 进一步优化建议

1. **错误边界**: 添加 React Error Boundary 组件
2. **加载状态**: 改进加载指示器的显示逻辑
3. **用户体验**: 添加页面切换动画
4. **数据验证**: 增强表单验证逻辑
5. **性能优化**: 使用 React.memo 优化重渲染

## 代码结构改进

建议将复杂的视图切换逻辑抽取为独立的自定义 hook：

```typescript
// useViewManager.ts
export function useViewManager() {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  
  const showEdit = useCallback((prompt?: Prompt) => {
    setEditingPrompt(prompt || null);
    setCurrentView('edit');
  }, []);
  
  const showList = useCallback(() => {
    setCurrentView('list');
    setEditingPrompt(null);
  }, []);
  
  return { currentView, showEdit, showList };
}
```

这样可以让代码更清晰、更易维护。