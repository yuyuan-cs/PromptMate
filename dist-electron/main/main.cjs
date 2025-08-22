const { app, BrowserWindow, ipcMain, globalShortcut, Menu, dialog, Tray } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const https = require('https');
const { spawn } = require('child_process');

// 根据环境设置
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Configure logging (optional)
log.transports.file.level = 'info';
log.info('App starting...');

// --- Auto Updater Setup ---
autoUpdater.logger = log; // Pipe autoUpdater logs to electron-log
autoUpdater.autoDownload = false; // Disable auto download, let user confirm

// 禁用自动更新检查，避免错误
autoUpdater.autoRunAppAfterInstall = false;

// GitHub API配置
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_REPO_OWNER = 'yy0691';
const GITHUB_REPO_NAME = 'PromptMate';

// 版本比较函数
function compareVersions(version1, version2) {
  try {
    // 验证版本号格式
    if (!version1 || !version2) {
      throw new Error('版本号不能为空');
    }
    
    if (typeof version1 !== 'string' || typeof version2 !== 'string') {
      throw new Error('版本号必须是字符串');
    }
    
    // 移除版本号前缀（如 'v'）
    const cleanVersion1 = version1.replace(/^[vV]/, '');
    const cleanVersion2 = version2.replace(/^[vV]/, '');
    
    // 验证版本号格式
    const versionRegex = /^\d+(\.\d+)*$/;
    if (!versionRegex.test(cleanVersion1) || !versionRegex.test(cleanVersion2)) {
      throw new Error('版本号格式无效');
    }
    
    const v1Parts = cleanVersion1.split('.').map(Number);
    const v2Parts = cleanVersion2.split('.').map(Number);
    
    // 确保两个版本号有相同的段数
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  } catch (error) {
    log.error('版本比较失败:', error);
    throw new Error(`版本比较失败: ${error.message}`);
  }
}

// 获取GitHub最新发布版本
async function getLatestGitHubRelease() {
  return new Promise((resolve, reject) => {
    const url = `${GITHUB_API_BASE}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`;
    
    // 设置请求超时
    const request = https.get(url, {
      headers: {
        'User-Agent': 'PromptMate-Update-Checker',
        'Accept': 'application/vnd.github.v3+json'
      },
      timeout: 10000 // 10秒超时
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const release = JSON.parse(data);
            
            // 验证版本号格式
            const version = release.tag_name.replace('v', '');
            if (!/^\d+\.\d+\.\d+$/.test(version)) {
              reject(new Error('无效的版本号格式'));
              return;
            }
            
            resolve({
              version: version,
              name: release.name || release.tag_name,
              body: release.body || '',
              published_at: release.published_at,
              html_url: release.html_url,
              assets: release.assets || []
            });
          } else if (res.statusCode === 404) {
            reject(new Error('未找到发布版本'));
          } else if (res.statusCode === 403) {
            reject(new Error('GitHub API访问受限，可能达到请求限制'));
          } else {
            reject(new Error(`GitHub API返回状态码: ${res.statusCode}`));
          }
        } catch (error) {
          reject(new Error(`解析GitHub响应失败: ${error.message}`));
        }
      });
    });
    
    // 设置超时处理
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('GitHub API请求超时'));
    });
    
    request.on('error', (error) => {
      reject(new Error(`GitHub API请求失败: ${error.message}`));
    });
  });
}

// 检查更新函数
function checkForUpdates() {
  log.info('Checking for updates...');
  
  // 设置更新检查超时
  const updateTimeout = setTimeout(() => {
    log.warn('Update check timeout, skipping...');
  }, 10000); // 10秒超时
  
  autoUpdater.checkForUpdatesAndNotify()
    .then(() => {
      clearTimeout(updateTimeout);
      log.info('Update check completed');
    })
    .catch(err => {
      clearTimeout(updateTimeout);
      log.error('Error checking for updates:', err);
      // 不显示错误对话框，静默处理
    });
}

// 获取应用信息
function getAppInfo() {
  try {
    const packageJson = require('../../package.json');
    
    // 获取构建日期，优先使用package.json中的buildDate
    let buildDate = packageJson.buildDate;
    if (!buildDate) {
      // 如果没有buildDate，尝试从文件修改时间获取
      try {
        const fs = require('fs');
        const packageJsonPath = require('path').join(__dirname, '../../package.json');
        const stats = fs.statSync(packageJsonPath);
        buildDate = stats.mtime.toISOString();
      } catch (error) {
        log.warn('无法获取文件修改时间，使用当前时间:', error);
        buildDate = new Date().toISOString();
      }
    }
    
    // 验证版本号格式
    const version = app.getVersion();
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      log.warn(`应用版本号格式无效: ${version}`);
    }
    
    return {
      version: version,
      name: app.getName(),
      description: packageJson.description || 'PromptMate is a desktop application that allows you to create and manage your prompts.',
      author: packageJson.author || { name: '泺源', email: 'yuyuan3162021@163.com' },
      homepage: packageJson.homepage || `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
      repository: packageJson.repository?.url || `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
      buildDate: buildDate,
      electronVersion: process.versions.electron || '未知',
      nodeVersion: process.versions.node || '未知',
      chromeVersion: process.versions.chrome || '未知'
    };
  } catch (error) {
    log.error('获取应用信息失败:', error);
    // 返回默认信息
    return {
      version: app.getVersion() || '1.0.0',
      name: app.getName() || 'PromptMate',
      description: 'PromptMate is a desktop application that allows you to create and manage your prompts.',
      author: { name: '泺源', email: 'yuyuan3162021@163.com' },
      homepage: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
      repository: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
      buildDate: new Date().toISOString(),
      electronVersion: process.versions.electron || '未知',
      nodeVersion: process.versions.node || '未知',
      chromeVersion: process.versions.chrome || '未知'
    };
  }
}

// 检查更新（增强版）
async function checkForUpdatesEnhanced() {
  try {
    log.info('开始检查更新...');
    
    // 获取当前版本
    const currentVersion = app.getVersion();
    log.info(`当前版本: ${currentVersion}`);
    
    // 验证当前版本格式
    if (!/^\d+\.\d+\.\d+$/.test(currentVersion)) {
      log.warn(`当前版本格式无效: ${currentVersion}`);
      return {
        success: false,
        hasUpdate: false,
        error: '当前版本格式无效',
        currentVersion: currentVersion
      };
    }
    
    // 获取GitHub最新发布
    let latestRelease;
    try {
      latestRelease = await getLatestGitHubRelease();
      log.info(`GitHub最新版本: ${latestRelease.version}`);
    } catch (error) {
      log.error('获取GitHub发布信息失败:', error);
      return {
        success: false,
        hasUpdate: false,
        error: `获取GitHub发布信息失败: ${error.message}`,
        currentVersion: currentVersion
      };
    }
    
    // 比较版本
    const versionComparison = compareVersions(currentVersion, latestRelease.version);
    log.info(`版本比较结果: ${versionComparison} (当前: ${currentVersion}, 最新: ${latestRelease.version})`);
    
    if (versionComparison < 0) {
      // 有新版本
      const updateType = getUpdateType(currentVersion, latestRelease.version);
      log.info(`发现新版本: ${latestRelease.version}, 更新类型: ${updateType}`);
      
      return {
        success: true,
        hasUpdate: true,
        currentVersion: currentVersion,
        latestVersion: latestRelease.version,
        releaseInfo: latestRelease,
        updateType: updateType
      };
    } else if (versionComparison === 0) {
      // 版本相同
      log.info('当前已是最新版本');
      return {
        success: true,
        hasUpdate: false,
        currentVersion: currentVersion,
        latestVersion: latestRelease.version,
        releaseInfo: latestRelease
      };
    } else {
      // 当前版本比GitHub版本新（可能是开发版本）
      log.info(`当前版本 ${currentVersion} 比GitHub版本 ${latestRelease.version} 新`);
      return {
        success: true,
        hasUpdate: false,
        currentVersion: currentVersion,
        latestVersion: latestRelease.version,
        releaseInfo: latestRelease,
        isDevelopment: true
      };
    }
  } catch (error) {
    log.error('检查更新失败:', error);
    return {
      success: false,
      hasUpdate: false,
      error: error.message,
      currentVersion: app.getVersion()
    };
  }
}

// 获取更新类型
function getUpdateType(currentVersion, latestVersion) {
  const currentParts = currentVersion.split('.').map(Number);
  const latestParts = latestVersion.split('.').map(Number);
  
  if (latestParts[0] > currentParts[0]) {
    return 'major'; // 主版本更新
  } else if (latestParts[1] > currentParts[1]) {
    return 'minor'; // 次版本更新
  } else {
    return 'patch'; // 补丁更新
  }
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
let tray = null;
let watcherProcess = null;

// 监控进程管理
function isWatcherRunning() {
  return !!(watcherProcess && !watcherProcess.killed);
}

function startWatcher() {
  try {
    if (isWatcherRunning()) {
      log.info('Watcher already running');
      return;
    }
    const scriptPath = path.join(__dirname, '../../scripts/sync-watcher/watch-sync.js');
    const env = {
      ...process.env,
      PM_APP_DATA_FILE: promptsPath,
      PM_MODE: 'prompts'
      // PM_WATCH_FILE can be optionally provided by user via env or future settings
    };
    // Use Electron binary to spawn Node script for best portability
    watcherProcess = spawn(process.execPath, [scriptPath], {
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    watcherProcess.stdout.on('data', (data) => log.info(String(data).trim()));
    watcherProcess.stderr.on('data', (data) => log.warn(String(data).trim()));
    watcherProcess.on('exit', (code, signal) => {
      log.info(`Watcher exited code=${code} signal=${signal}`);
      watcherProcess = null;
      updateTrayMenu();
    });
    log.info('Watcher started');
  } catch (e) {
    log.error('Failed to start watcher:', e);
  } finally {
    updateTrayMenu();
  }
}

function stopWatcher() {
  try {
    if (!isWatcherRunning()) return;
    watcherProcess.kill();
    log.info('Watcher stopped');
  } catch (e) {
    log.error('Failed to stop watcher:', e);
  } finally {
    updateTrayMenu();
  }
}

function toggleWatcher() {
  if (isWatcherRunning()) stopWatcher(); else startWatcher();
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, '../../public/favicon.ico');
    tray = new Tray(iconPath);
    tray.setToolTip('PromptMate');
    updateTrayMenu();
  } catch (e) {
    log.error('Failed to create tray:', e);
  }
}

function updateTrayMenu() {
  if (!tray) return;
  const running = isWatcherRunning();
  const settings = getSettings();
  const context = Menu.buildFromTemplate([
    {
      label: mainWindow && mainWindow.isVisible() ? '隐藏窗口' : '显示窗口',
      click: () => {
        if (!mainWindow) return;
        if (mainWindow.isVisible()) mainWindow.hide(); else mainWindow.show();
      }
    },
    { type: 'separator' },
    {
      label: running ? '停止同步监听' : '启动同步监听',
      click: () => toggleWatcher()
    },
    {
      label: settings.watcherAutoStart ? '开机自启：开' : '开机自启：关',
      type: 'checkbox',
      checked: !!settings.watcherAutoStart,
      click: (menuItem) => {
        const s = getSettings();
        s.watcherAutoStart = !!menuItem.checked;
        saveSettings(s);
        updateTrayMenu();
      }
    },
    { type: 'separator' },
    { label: '退出', role: 'quit' }
  ]);
  tray.setContextMenu(context);
}

// 默认设置
const defaultSettings = {
  theme: 'system',
  font: 'system-ui',
  fontSize: 14,
  alwaysOnTop: false,
  globalShortcut: 'CommandOrControl+Alt+P',
  watcherAutoStart: false
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
    // 生产环境：加载打包后的文件
    const indexPath = path.join(__dirname, '../../dist/index.html');
    console.log('生产环境加载路径:', indexPath);
    console.log('文件是否存在:', fs.existsSync(indexPath));
    
    // 检查dist目录内容
    const distDir = path.join(__dirname, '../../dist');
    console.log('dist目录是否存在:', fs.existsSync(distDir));
    if (fs.existsSync(distDir)) {
      console.log('dist目录内容:', fs.readdirSync(distDir));
    }
    
    // 检查assets目录
    const assetsDir = path.join(distDir, 'assets');
    console.log('assets目录是否存在:', fs.existsSync(assetsDir));
    if (fs.existsSync(assetsDir)) {
      console.log('assets目录内容:', fs.readdirSync(assetsDir));
    }
    
    mainWindow.loadFile(indexPath);
    
    // 生产环境不打开开发者工具
    // mainWindow.webContents.openDevTools();
    
    // 添加错误监听
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('页面加载失败:', errorCode, errorDescription);
      log.error('页面加载失败:', errorCode, errorDescription);
      
      // 如果加载失败，尝试重新加载
      setTimeout(() => {
        console.log('尝试重新加载页面...');
        mainWindow.loadFile(indexPath);
      }, 1000);
    });
    
    // 监听页面加载成功
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('生产环境页面加载成功');
      log.info('生产环境页面加载成功');
    });
    
    // 监听控制台消息
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`渲染进程控制台 [${level}]:`, message, `(${sourceId}:${line})`);
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
  // 创建系统托盘
  createTray();
  // 根据设置启动同步监听
  const s = getSettings();
  if (s.watcherAutoStart) {
    startWatcher();
  }

  // 暂时禁用自动更新检查，避免错误
  // checkForUpdates();

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
  stopWatcher();
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
  return getAppInfo();
});

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await checkForUpdatesEnhanced();
    return result;
  } catch (error) {
    console.error('检查更新出错:', error);
    return {
      success: false,
      hasUpdate: false,
      error: error.message,
      currentVersion: app.getVersion()
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