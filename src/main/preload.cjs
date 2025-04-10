const { contextBridge, ipcRenderer } = require('electron');

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 设置管理
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // 提示词管理
  getPrompts: () => ipcRenderer.invoke('get-prompts'),
  savePrompts: (prompts) => ipcRenderer.invoke('save-prompts', prompts),
  
  // 窗口控制
  togglePinWindow: (shouldPin) => ipcRenderer.send('toggle-pin-window', shouldPin),
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  
  // 数据导入导出
  exportData: (options) => ipcRenderer.invoke('export-data', options),
  importData: (options) => ipcRenderer.invoke('import-data', options),
  
  // 应用更新
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // 更新事件监听
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (_, info) => callback(info));
    return () => ipcRenderer.removeAllListeners('update-available');
  },
  onUpdateNotAvailable: (callback) => {
    ipcRenderer.on('update-not-available', (_, info) => callback(info));
    return () => ipcRenderer.removeAllListeners('update-not-available');
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', (_, error) => callback(error));
    return () => ipcRenderer.removeAllListeners('update-error');
  }
}); 