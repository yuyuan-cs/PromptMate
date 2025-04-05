const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 设置开发环境
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    frame: true,
    show: false,
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // 在开发环境和生产环境中都使用打包后的文件
  const startUrl = `file://${path.join(__dirname, '../../dist/index.html')}`;

  console.log('加载URL:', startUrl);
  console.log('当前目录:', __dirname);
  console.log('渲染进程路径:', path.join(__dirname, '../../dist/index.html'));
  
  // 打开开发者工具，方便调试
  mainWindow.webContents.openDevTools();

  mainWindow.loadURL(startUrl);

  // 当窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 注册全局快捷键
  globalShortcut.register('CommandOrControl+Alt+P', () => {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
  });

  // 窗口置顶控制
  ipcMain.on('toggle-pin-window', (event, shouldPin) => {
    mainWindow.setAlwaysOnTop(shouldPin);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 确保只有一个应用实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on('will-quit', () => {
    // 注销所有快捷键
    globalShortcut.unregisterAll();
  });
}

// 数据文件管理
const userDataPath = app.getPath('userData');
const promptsFilePath = path.join(userDataPath, 'prompts.json');
const settingsFilePath = path.join(userDataPath, 'settings.json');

// 初始化数据文件
function initDataFiles() {
  // 确保数据目录存在
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  // 初始化prompts.json
  if (!fs.existsSync(promptsFilePath)) {
    const defaultPrompts = {
      prompts: []
    };
    fs.writeFileSync(promptsFilePath, JSON.stringify(defaultPrompts, null, 2));
  }

  // 初始化settings.json
  if (!fs.existsSync(settingsFilePath)) {
    const defaultSettings = {
      theme: 'light',
      font: 'system-ui',
      fontSize: 14,
      alwaysOnTop: false
    };
    fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2));
  }
}

app.whenReady().then(() => {
  initDataFiles();

  // 处理IPC通信
  // 获取所有提示语
  ipcMain.handle('get-prompts', async () => {
    try {
      const data = fs.readFileSync(promptsFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('读取提示语文件失败:', error);
      return { prompts: [] };
    }
  });

  // 保存提示语
  ipcMain.handle('save-prompts', async (event, promptsData) => {
    try {
      fs.writeFileSync(promptsFilePath, JSON.stringify(promptsData, null, 2));
      return { success: true };
    } catch (error) {
      console.error('保存提示语文件失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 获取设置
  ipcMain.handle('get-settings', async () => {
    try {
      const data = fs.readFileSync(settingsFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('读取设置文件失败:', error);
      return {
        theme: 'light',
        font: 'system-ui',
        fontSize: 14,
        alwaysOnTop: false
      };
    }
  });

  // 保存设置
  ipcMain.handle('save-settings', async (event, settingsData) => {
    try {
      fs.writeFileSync(settingsFilePath, JSON.stringify(settingsData, null, 2));
      
      // 应用窗口置顶设置
      if (mainWindow && settingsData.alwaysOnTop !== undefined) {
        mainWindow.setAlwaysOnTop(settingsData.alwaysOnTop);
      }
      
      return { success: true };
    } catch (error) {
      console.error('保存设置文件失败:', error);
      return { success: false, error: error.message };
    }
  });
}); 