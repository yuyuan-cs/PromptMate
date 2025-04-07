import require$$0 from "electron";
import require$$1 from "path";
import require$$2 from "fs";
var main = {};
const { app, BrowserWindow, ipcMain, globalShortcut, Menu } = require$$0;
const path = require$$1;
const fs = require$$2;
const userDataPath = app.getPath("userData");
const configPath = path.join(userDataPath, "config");
const promptsPath = path.join(configPath, "prompts.json");
const settingsPath = path.join(configPath, "settings.json");
if (!fs.existsSync(configPath)) {
  fs.mkdirSync(configPath, { recursive: true });
}
let mainWindow = null;
const defaultSettings = {
  theme: "system",
  font: "system-ui",
  fontSize: 14,
  alwaysOnTop: false,
  globalShortcut: "CommandOrControl+Alt+P"
};
const defaultPrompts = [
  {
    id: "1",
    title: "简单翻译",
    content: "请将以下文本翻译成中文:\n\n",
    category: "翻译",
    tags: ["简体中文", "基础"]
  },
  {
    id: "2",
    title: "代码解释",
    content: "请解释以下代码的功能和工作原理:\n\n",
    category: "编程",
    tags: ["代码", "解释"]
  },
  {
    id: "3",
    title: "文章摘要",
    content: "请为以下文章生成一个简洁的摘要，不超过100字:\n\n",
    category: "写作",
    tags: ["摘要", "总结"]
  }
];
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs")
    }
  });
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  const settings = getSettings();
  mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
  registerGlobalShortcut(settings.globalShortcut);
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  const template = [
    {
      label: "PromptMate",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      label: "编辑",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" }
      ]
    },
    {
      label: "视图",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
function registerGlobalShortcut(shortcut) {
  globalShortcut.unregisterAll();
  globalShortcut.register(shortcut, () => {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
  });
}
function getSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const settingsData = fs.readFileSync(settingsPath, "utf8");
      return { ...defaultSettings, ...JSON.parse(settingsData) };
    }
    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
    return defaultSettings;
  } catch (error) {
    console.error("读取设置出错:", error);
    return defaultSettings;
  }
}
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return { success: true };
  } catch (error) {
    console.error("保存设置出错:", error);
    return { success: false, error: error.message };
  }
}
function getPrompts() {
  try {
    if (fs.existsSync(promptsPath)) {
      const promptsData = fs.readFileSync(promptsPath, "utf8");
      return { prompts: JSON.parse(promptsData) };
    }
    fs.writeFileSync(promptsPath, JSON.stringify(defaultPrompts, null, 2));
    return { prompts: defaultPrompts };
  } catch (error) {
    console.error("读取提示词出错:", error);
    return { prompts: defaultPrompts };
  }
}
function savePrompts(promptsData) {
  try {
    fs.writeFileSync(promptsPath, JSON.stringify(promptsData.prompts, null, 2));
    return { success: true };
  } catch (error) {
    console.error("保存提示词出错:", error);
    return { success: false, error: error.message };
  }
}
ipcMain.handle("get-settings", () => getSettings());
ipcMain.handle("save-settings", (_, settings) => {
  const result = saveSettings(settings);
  if (result.success && settings.alwaysOnTop !== void 0 && mainWindow) {
    mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
  }
  if (result.success && settings.globalShortcut && settings.globalShortcut !== getSettings().globalShortcut) {
    registerGlobalShortcut(settings.globalShortcut);
  }
  return result;
});
ipcMain.handle("get-prompts", () => getPrompts());
ipcMain.handle("save-prompts", (_, promptsData) => savePrompts(promptsData));
ipcMain.on("toggle-pin-window", (_, shouldPin) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(shouldPin);
    const settings = getSettings();
    settings.alwaysOnTop = shouldPin;
    saveSettings(settings);
  }
});
ipcMain.handle("export-data", async (_, { filePath }) => {
  try {
    const settings = getSettings();
    const { prompts } = getPrompts();
    const exportData = { settings, prompts };
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    return { success: true };
  } catch (error) {
    console.error("导出数据出错:", error);
    return { success: false, error: error.message };
  }
});
ipcMain.handle("import-data", async (_, { filePath }) => {
  try {
    const importData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (importData.settings) {
      saveSettings(importData.settings);
      if (mainWindow && importData.settings.alwaysOnTop !== void 0) {
        mainWindow.setAlwaysOnTop(importData.settings.alwaysOnTop);
      }
      if (importData.settings.globalShortcut) {
        registerGlobalShortcut(importData.settings.globalShortcut);
      }
    }
    if (importData.prompts) {
      savePrompts({ prompts: importData.prompts });
    }
    return { success: true };
  } catch (error) {
    console.error("导入数据出错:", error);
    return { success: false, error: error.message };
  }
});
export {
  main as default
};
