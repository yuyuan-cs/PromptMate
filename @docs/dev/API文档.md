# PromptMate API文档

本文档描述PromptMate应用中主进程与渲染进程之间的通信接口。所有API基于Electron的IPC（进程间通信）机制实现。

## 1. 提示语管理 API

### 1.1 获取所有提示语

从本地JSON文件读取所有提示语数据。

- **IPC通道**: `get-prompts`
- **通信方式**: `invoke`（异步调用）
- **参数**: 无
- **返回值**:

```javascript
{
  prompts: [
    {
      id: "string",         // 提示语唯一ID
      title: "string",      // 提示语标题
      content: "string",    // 提示语内容
      category: "string",   // 分类
      tags: ["string"]      // 标签数组
    },
    // ...更多提示语
  ]
}
```

- **使用示例**:

```javascript
// 渲染进程中调用
const { ipcRenderer } = require('electron');

async function getPrompts() {
  const result = await ipcRenderer.invoke('get-prompts');
  return result.prompts || [];
}
```

### 1.2 保存提示语

将提示语数据保存到本地JSON文件。

- **IPC通道**: `save-prompts`
- **通信方式**: `invoke`（异步调用）
- **参数**:

```javascript
{
  prompts: [
    {
      id: "string",         // 提示语唯一ID
      title: "string",      // 提示语标题
      content: "string",    // 提示语内容
      category: "string",   // 分类
      tags: ["string"]      // 标签数组
    },
    // ...更多提示语
  ]
}
```

- **返回值**:

```javascript
{
  success: boolean,         // 是否保存成功
  error?: string            // 如果保存失败，返回错误信息
}
```

- **使用示例**:

```javascript
// 渲染进程中调用
const { ipcRenderer } = require('electron');

async function savePrompts(promptsArray) {
  const data = { prompts: promptsArray };
  const result = await ipcRenderer.invoke('save-prompts', data);
  
  if (result.success) {
    console.log('提示语保存成功');
  } else {
    console.error('提示语保存失败:', result.error);
  }
  
  return result.success;
}
```

## 2. 设置管理 API

### 2.1 获取应用设置

从本地JSON文件读取应用设置。

- **IPC通道**: `get-settings`
- **通信方式**: `invoke`（异步调用）
- **参数**: 无
- **返回值**:

```javascript
{
  theme: "string",          // 主题（'light', 'dark', 等）
  font: "string",           // 字体名称
  fontSize: number,         // 字体大小
  alwaysOnTop: boolean      // 窗口是否置顶
}
```

- **使用示例**:

```javascript
// 渲染进程中调用
const { ipcRenderer } = require('electron');

async function getSettings() {
  const settings = await ipcRenderer.invoke('get-settings');
  return settings;
}
```

### 2.2 保存应用设置

将应用设置保存到本地JSON文件。

- **IPC通道**: `save-settings`
- **通信方式**: `invoke`（异步调用）
- **参数**:

```javascript
{
  theme: "string",          // 主题（'light', 'dark', 等）
  font: "string",           // 字体名称
  fontSize: number,         // 字体大小
  alwaysOnTop: boolean      // 窗口是否置顶
}
```

- **返回值**:

```javascript
{
  success: boolean,         // 是否保存成功
  error?: string            // 如果保存失败，返回错误信息
}
```

- **使用示例**:

```javascript
// 渲染进程中调用
const { ipcRenderer } = require('electron');

async function saveSettings(settings) {
  const result = await ipcRenderer.invoke('save-settings', settings);
  
  if (result.success) {
    console.log('设置保存成功');
  } else {
    console.error('设置保存失败:', result.error);
  }
  
  return result.success;
}
```

## 3. 窗口控制 API

### 3.1 切换窗口置顶状态

控制应用窗口是否置顶显示。

- **IPC通道**: `toggle-pin-window`
- **通信方式**: `send`（单向通信）
- **参数**: `boolean`（是否置顶）
- **返回值**: 无
- **使用示例**:

```javascript
// 渲染进程中调用
const { ipcRenderer } = require('electron');

function setWindowAlwaysOnTop(shouldPin) {
  ipcRenderer.send('toggle-pin-window', shouldPin);
}
```

## 4. 数据导入导出 API (待实现)

### 4.1 导出数据

将应用数据（提示语和设置）导出到指定文件。

- **IPC通道**: `export-data`
- **通信方式**: `invoke`（异步调用）
- **参数**: 

```javascript
{
  filePath: "string"        // 导出文件路径
}
```

- **返回值**:

```javascript
{
  success: boolean,         // 是否导出成功
  error?: string            // 如果导出失败，返回错误信息
}
```

### 4.2 导入数据

从指定文件导入应用数据（提示语和设置）。

- **IPC通道**: `import-data`
- **通信方式**: `invoke`（异步调用）
- **参数**: 

```javascript
{
  filePath: "string"        // 导入文件路径
}
```

- **返回值**:

```javascript
{
  success: boolean,         // 是否导入成功
  error?: string            // 如果导入失败，返回错误信息
}
```

## 5. 错误处理

所有API调用应当包含适当的错误处理，错误信息将通过返回值中的`error`字段返回。在渲染进程中，应当使用`try-catch`块处理可能的异常。

```javascript
try {
  const result = await ipcRenderer.invoke('api-channel', params);
  // 处理成功结果
} catch (error) {
  // 处理异常
  console.error('API调用失败:', error);
}
``` 