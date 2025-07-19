# 窗口控制 API

本项目通过 `window.electronAPI` 向渲染进程暴露了窗口控制相关的 API，可用于最小化、最大化、关闭窗口。

## 可用方法

- `window.electronAPI.minimize()`
- `window.electronAPI.maximize()`
- `window.electronAPI.close()`
- `window.electronAPI.togglePinWindow(shouldPin: boolean)`

## 用法示例

```js
// 最小化窗口
window.electronAPI.minimize();

// 最大化/还原窗口
window.electronAPI.maximize();

// 关闭窗口
window.electronAPI.close();

// 置顶窗口
window.electronAPI.togglePinWindow(true);
```

这些方法会通过 Electron 的 IPC 机制与主进程通信，实现窗口的实际操作。 