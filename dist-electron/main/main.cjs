const { app, BrowserWindow, ipcMain, globalShortcut, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// 强制设置开发环境
process.env.NODE_ENV = 'development';

// Configure logging (optional)
log.transports.file.level = 'info';
log.info('App starting...');

// --- Auto Updater Setup ---
autoUpdater.logger = log; // Pipe autoUpdater logs to electron-log
autoUpdater.autoDownload = false; // Disable auto download, let user confirm

// Check for updates function
function checkForUpdates() {
  log.info('Checking for updates...');
  autoUpdater.checkForUpdatesAndNotify().catch(err => {
    log.error('Error checking for updates:', err);
  });
}

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
  const preloadPath = path.join(__dirname, 'preload.cjs');
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', fs.existsSync(preloadPath));
  
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
      preload: preloadPath,  // 启用preload脚本
      webSecurity: false,  // 开发环境禁用web安全
      allowRunningInsecureContent: true,  // 允许运行不安全内容
      enableRemoteModule: false,  // 禁用远程模块
      worldSafeExecuteJavaScript: true  // 启用安全的JavaScript执行
    }
  });

  // 根据环境加载应用（开发环境或生产环境）
  const isDev = process.env.NODE_ENV === 'development';
  console.log('当前环境:', isDev ? 'development' : 'production');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  if (isDev) {
    // 直接连接到开发服务器
    console.log('尝试连接到开发服务器: http://localhost:5173');
    log.info('尝试连接到开发服务器: http://localhost:5173');
    
    mainWindow.loadURL('http://localhost:5173');
    
    // 监听页面加载失败事件
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('页面加载失败:', errorCode, errorDescription, validatedURL);
      log.error('页面加载失败:', errorCode, errorDescription, validatedURL);
    });
    
    // 监听页面加载成功事件
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('页面加载成功');
      log.info('页面加载成功');
    });
    
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    
    // 在生产环境也打开开发者工具，便于调试
    // mainWindow.webContents.openDevTools();
    
    // 添加错误监听
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('页面加载失败:', errorCode, errorDescription);
      log.error('页面加载失败:', errorCode, errorDescription);
    });
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

  // Check for updates after window is created
  checkForUpdates();

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

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
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

// 添加应用信息和更新检查相关IPC
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    description: 'PromptMate是一个帮助你创建和管理提示词的桌面应用'
  };
});

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    if (result && result.updateInfo) {
      return {
        success: true,
        hasUpdate: result.updateInfo.version !== app.getVersion(),
        version: result.updateInfo.version
      };
    }
    return {
      success: true,
      hasUpdate: false
    };
  } catch (error) {
    console.error('检查更新出错:', error);
    return {
      success: false,
      hasUpdate: false,
      error: error.message
    };
  }
});

// --- Auto Updater Event Listeners ---

// Fired when an update is found
autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  dialog.showMessageBox({
    type: 'info',
    title: '发现新版本',
    message: `发现新版本 ${info.version}，是否现在下载？`, // Use info.version
    buttons: ['是', '否']
  }).then(result => {
    if (result.response === 0) { // User clicked '是'
      log.info('User agreed to download update.');
      autoUpdater.downloadUpdate();
    } else {
      log.info('User declined update download.');
    }
  });
});

// Fired when an update is not available
autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.', info);
  // Optionally notify the user, or just log it
});

// Fired on update download progress
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
  // You can send progress to the renderer process if you want to display it
  // mainWindow.webContents.send('update-progress', progressObj);
});

// Fired when an update has been downloaded
autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  dialog.showMessageBox({
    type: 'info',
    title: '更新已下载',
    message: '新版本已下载完毕，是否立即重启应用以进行安装？',
    buttons: ['立即重启', '稍后重启']
  }).then(result => {
    if (result.response === 0) { // User clicked '立即重启'
      log.info('User agreed to restart and install update.');
      autoUpdater.quitAndInstall();
    } else {
      log.info('User deferred update installation.');
    }
  });
});

// Fired when there is an error during the update process
autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err);
  dialog.showErrorBox('更新出错', `检查或下载更新时遇到错误: ${err.message}`);
}); 