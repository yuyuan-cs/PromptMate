const { app, BrowserWindow, ipcMain, globalShortcut, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// 应用配置目录
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config');
const promptsPath = path.join(configPath, 'prompts.json');
const settingsPath = path.join(configPath, 'settings.json');

// 确保配置目录存在
if (!fs.existsSync(configPath)) {
  fs.mkdirSync(configPath, { recursive: true });
}

// 主窗口实例
let mainWindow = null;

// 默认设置
const defaultSettings = {
  theme: 'system',
  font: 'system-ui',
  fontSize: 14,
  alwaysOnTop: false,
  globalShortcut: 'CommandOrControl+Alt+P'
};

// 默认提示词数据
const defaultPrompts = [
  {
    id: '1',
    title: '简单翻译',
    content: '请将以下文本翻译成中文:\n\n',
    category: '翻译',
    tags: ['简体中文', '基础']
  },
  {
    id: '2',
    title: '代码解释',
    content: '请解释以下代码的功能和工作原理:\n\n',
    category: '编程',
    tags: ['代码', '解释']
  },
  {
    id: '3',
    title: '文章摘要',
    content: '请为以下文章生成一个简洁的摘要，不超过100字:\n\n',
    category: '写作',
    tags: ['摘要', '总结']
  }
];

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: false,  // 隐藏默认窗口边框
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 根据环境加载应用（开发环境或生产环境）
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  // 窗口关闭事件处理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 加载设置并应用窗口置顶状态
  const settings = getSettings();
  mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
  
  // 注册全局快捷键
  registerGlobalShortcut(settings.globalShortcut);
}

// 初始化应用
app.whenReady().then(() => {
  createWindow();

  // MacOS相关设置
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
  // 设置应用菜单（可选）
  const template = [
    {
      label: 'PromptMate',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

// 应用退出前
app.on('will-quit', () => {
  // 注销全局快捷键
  globalShortcut.unregisterAll();
});

// 应用退出处理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 注册全局快捷键
function registerGlobalShortcut(shortcut) {
  // 先注销所有快捷键
  globalShortcut.unregisterAll();
  
  // 注册新快捷键
  globalShortcut.register(shortcut, () => {
    // 如果窗口已最小化，则恢复窗口
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    
    // 窗口获取焦点
    mainWindow.focus();
    
    // 如果窗口隐藏，则显示窗口
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
  });
}

// 获取设置
function getSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const settingsData = fs.readFileSync(settingsPath, 'utf8');
      return { ...defaultSettings, ...JSON.parse(settingsData) };
    }
    
    // 如果设置文件不存在，创建默认设置
    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
    return defaultSettings;
  } catch (error) {
    console.error('读取设置出错:', error);
    return defaultSettings;
  }
}

// 保存设置
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return { success: true };
  } catch (error) {
    console.error('保存设置出错:', error);
    return { success: false, error: error.message };
  }
}

// 获取提示词
function getPrompts() {
  try {
    if (fs.existsSync(promptsPath)) {
      const promptsData = fs.readFileSync(promptsPath, 'utf8');
      return { prompts: JSON.parse(promptsData) };
    }
    
    // 如果提示词文件不存在，创建默认提示词
    fs.writeFileSync(promptsPath, JSON.stringify(defaultPrompts, null, 2));
    return { prompts: defaultPrompts };
  } catch (error) {
    console.error('读取提示词出错:', error);
    return { prompts: defaultPrompts };
  }
}

// 保存提示词
function savePrompts(promptsData) {
  try {
    fs.writeFileSync(promptsPath, JSON.stringify(promptsData.prompts, null, 2));
    return { success: true };
  } catch (error) {
    console.error('保存提示词出错:', error);
    return { success: false, error: error.message };
  }
}

// 注册IPC通信
ipcMain.handle('get-settings', () => getSettings());
ipcMain.handle('save-settings', (_, settings) => {
  const result = saveSettings(settings);
  
  // 如果设置成功并包含alwaysOnTop属性，则更新窗口置顶状态
  if (result.success && settings.alwaysOnTop !== undefined && mainWindow) {
    mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
  }
  
  // 如果设置成功并包含globalShortcut属性，则更新全局快捷键
  if (result.success && settings.globalShortcut && settings.globalShortcut !== getSettings().globalShortcut) {
    registerGlobalShortcut(settings.globalShortcut);
  }
  
  return result;
});

ipcMain.handle('get-prompts', () => getPrompts());
ipcMain.handle('save-prompts', (_, promptsData) => savePrompts(promptsData));

ipcMain.on('toggle-pin-window', (_, shouldPin) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(shouldPin);
    
    // 更新设置
    const settings = getSettings();
    settings.alwaysOnTop = shouldPin;
    saveSettings(settings);
  }
});

// 导出/导入数据
ipcMain.handle('export-data', async (_, { filePath }) => {
  try {
    const settings = getSettings();
    const { prompts } = getPrompts();
    const exportData = { settings, prompts };
    
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    return { success: true };
  } catch (error) {
    console.error('导出数据出错:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import-data', async (_, { filePath }) => {
  try {
    const importData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (importData.settings) {
      saveSettings(importData.settings);
      
      // 更新窗口置顶状态
      if (mainWindow && importData.settings.alwaysOnTop !== undefined) {
        mainWindow.setAlwaysOnTop(importData.settings.alwaysOnTop);
      }
      
      // 更新全局快捷键
      if (importData.settings.globalShortcut) {
        registerGlobalShortcut(importData.settings.globalShortcut);
      }
    }
    
    if (importData.prompts) {
      savePrompts({ prompts: importData.prompts });
    }
    
    return { success: true };
  } catch (error) {
    console.error('导入数据出错:', error);
    return { success: false, error: error.message };
  }
}); 