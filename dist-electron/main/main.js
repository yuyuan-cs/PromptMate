import x from "electron";
import D from "path";
import F from "fs";
var j = {};
const { app: i, BrowserWindow: S, ipcMain: n, globalShortcut: f, Menu: h } = x, a = D, s = F, N = i.getPath("userData"), m = a.join(N, "config"), u = a.join(m, "prompts.json"), p = a.join(m, "settings.json");
s.existsSync(m) || s.mkdirSync(m, { recursive: !0 });
let t = null;
const c = {
  theme: "system",
  font: "system-ui",
  fontSize: 14,
  alwaysOnTop: !1,
  globalShortcut: "CommandOrControl+Alt+P"
}, g = [
  {
    id: "1",
    title: "简单翻译",
    content: `请将以下文本翻译成中文:

`,
    category: "翻译",
    tags: ["简体中文", "基础"]
  },
  {
    id: "2",
    title: "代码解释",
    content: `请解释以下代码的功能和工作原理:

`,
    category: "编程",
    tags: ["代码", "解释"]
  },
  {
    id: "3",
    title: "文章摘要",
    content: `请为以下文章生成一个简洁的摘要，不超过100字:

`,
    category: "写作",
    tags: ["摘要", "总结"]
  }
];
function w() {
  t = new S({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: !1,
    // 隐藏默认窗口边框
    titleBarStyle: "hidden",
    // 使用'hidden'而不是'hiddenInset'
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      preload: a.join(__dirname, "preload.cjs")
    }
  }), process.env.NODE_ENV === "development" ? (t.loadURL("http://localhost:5173"), t.webContents.openDevTools()) : t.loadFile(a.join(__dirname, "../../dist/index.html")), t.on("closed", () => {
    t = null;
  });
  const e = l();
  t.setAlwaysOnTop(e.alwaysOnTop), d(e.globalShortcut);
}
i.whenReady().then(() => {
  w(), i.on("activate", () => {
    S.getAllWindows().length === 0 && w();
  });
  const o = [
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
  ], e = h.buildFromTemplate(o);
  h.setApplicationMenu(e);
});
i.on("will-quit", () => {
  f.unregisterAll();
});
i.on("window-all-closed", () => {
  process.platform !== "darwin" && i.quit();
});
function d(o) {
  f.unregisterAll(), f.register(o, () => {
    t.isMinimized() && t.restore(), t.focus(), t.isVisible() || t.show();
  });
}
function l() {
  try {
    if (s.existsSync(p)) {
      const o = s.readFileSync(p, "utf8");
      return { ...c, ...JSON.parse(o) };
    }
    return s.writeFileSync(p, JSON.stringify(c, null, 2)), c;
  } catch (o) {
    return console.error("读取设置出错:", o), c;
  }
}
function y(o) {
  try {
    return s.writeFileSync(p, JSON.stringify(o, null, 2)), { success: !0 };
  } catch (e) {
    return console.error("保存设置出错:", e), { success: !1, error: e.message };
  }
}
function b() {
  try {
    if (s.existsSync(u)) {
      const o = s.readFileSync(u, "utf8");
      return { prompts: JSON.parse(o) };
    }
    return s.writeFileSync(u, JSON.stringify(g, null, 2)), { prompts: g };
  } catch (o) {
    return console.error("读取提示词出错:", o), { prompts: g };
  }
}
function O(o) {
  try {
    return s.writeFileSync(u, JSON.stringify(o.prompts, null, 2)), { success: !0 };
  } catch (e) {
    return console.error("保存提示词出错:", e), { success: !1, error: e.message };
  }
}
n.handle("get-settings", () => l());
n.handle("save-settings", (o, e) => {
  const r = y(e);
  return r.success && e.alwaysOnTop !== void 0 && t && t.setAlwaysOnTop(e.alwaysOnTop), r.success && e.globalShortcut && e.globalShortcut !== l().globalShortcut && d(e.globalShortcut), r;
});
n.handle("get-prompts", () => b());
n.handle("save-prompts", (o, e) => O(e));
n.on("toggle-pin-window", (o, e) => {
  if (t) {
    t.setAlwaysOnTop(e);
    const r = l();
    r.alwaysOnTop = e, y(r);
  }
});
n.on("minimize-window", () => {
  t && t.minimize();
});
n.on("maximize-window", () => {
  t && (t.isMaximized() ? t.unmaximize() : t.maximize());
});
n.on("close-window", () => {
  t && t.close();
});
n.handle("export-data", async (o, { filePath: e }) => {
  try {
    const r = l(), { prompts: v } = b(), T = { settings: r, prompts: v };
    return s.writeFileSync(e, JSON.stringify(T, null, 2)), { success: !0 };
  } catch (r) {
    return console.error("导出数据出错:", r), { success: !1, error: r.message };
  }
});
n.handle("import-data", async (o, { filePath: e }) => {
  try {
    const r = JSON.parse(s.readFileSync(e, "utf8"));
    return r.settings && (y(r.settings), t && r.settings.alwaysOnTop !== void 0 && t.setAlwaysOnTop(r.settings.alwaysOnTop), r.settings.globalShortcut && d(r.settings.globalShortcut)), r.prompts && O({ prompts: r.prompts }), { success: !0 };
  } catch (r) {
    return console.error("导入数据出错:", r), { success: !1, error: r.message };
  }
});
export {
  j as default
};
