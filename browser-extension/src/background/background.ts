/**
 * PromptMate 浏览器扩展背景脚本 - 简化版本
 */

console.log('PromptMate 背景脚本已启动');

// Storage keys
type Prompt = { id: string; title: string; content: string; category: string; isFavorite?: boolean };
type UsageRecord = { promptId: string; timestamp: string; action: 'copy' | 'inject' | 'view' };
type Category = { id: string; name: string };
type Settings = {
  autoExportOnChange?: boolean;
};

// helpers
const readLocal = <T = any>(keys: string[]): Promise<Record<string, T>> =>
  new Promise((resolve) => chrome.storage.local.get(keys, resolve));

const removeAllContextMenus = (): Promise<void> =>
  new Promise((resolve) => chrome.contextMenus.removeAll(() => resolve()));

function uniqueBy<T>(arr: T[], key: (t: T) => string): T[] {
  const set = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!set.has(k)) { set.add(k); out.push(item); }
  }
  return out;
}

async function buildContextMenus() {
  await removeAllContextMenus();

  // parent
  chrome.contextMenus.create({ id: 'promptmate-main', title: 'PromptMate', contexts: ['all'] });
  chrome.contextMenus.create({ id: 'pm-open-sidepanel', parentId: 'promptmate-main', title: '打开侧边栏', contexts: ['all'] });

  const data = await readLocal<any>(['prompts', 'usageRecords', 'categories']);
  const prompts: Prompt[] = data.prompts || [];
  const usage: UsageRecord[] = data.usageRecords || [];
  const categories: Category[] = data.categories || [];

  // Favorites
  const favorites = prompts.filter(p => !!p.isFavorite).slice(0, 10);
  if (favorites.length) {
    chrome.contextMenus.create({ id: 'pm-fav', parentId: 'promptmate-main', title: '收藏', contexts: ['all'] });
    for (const p of favorites) {
      chrome.contextMenus.create({ id: `pm-inject:${p.id}`, parentId: 'pm-fav', title: p.title, contexts: ['all'] });
    }
  }

  // Recent (based on usageRecords)
  const recentMap = new Map<string, Prompt>();
  const sortedUsage = [...usage]
    .filter(u => u.promptId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  for (const u of sortedUsage) {
    const p = prompts.find(pp => pp.id === u.promptId);
    if (p && !recentMap.has(p.id)) recentMap.set(p.id, p);
    if (recentMap.size >= 10) break;
  }
  const recent = Array.from(recentMap.values());
  if (recent.length) {
    chrome.contextMenus.create({ id: 'pm-recent', parentId: 'promptmate-main', title: '最近使用', contexts: ['all'] });
    for (const p of recent) {
      chrome.contextMenus.create({ id: `pm-inject:${p.id}`, parentId: 'pm-recent', title: p.title, contexts: ['all'] });
    }
  }

  // By categories
  if (categories.length) {
    chrome.contextMenus.create({ id: 'pm-categories', parentId: 'promptmate-main', title: '按分类', contexts: ['all'] });
    for (const c of categories.slice(0, 8)) { // 防止过多
      const catId = `pm-cat:${c.id}`;
      chrome.contextMenus.create({ id: catId, parentId: 'pm-categories', title: c.name, contexts: ['all'] });
      const items = prompts.filter(p => p.category === c.id).slice(0, 10);
      for (const p of items) {
        chrome.contextMenus.create({ id: `pm-inject:${p.id}`, parentId: catId, title: p.title, contexts: ['all'] });
      }
    }
  }
}

// 导出全部数据为 JSON 字符串
async function exportAllDataJSON(): Promise<string> {
  const data = await readLocal<any>(['prompts', 'categories', 'settings']);
  const exportData = {
    prompts: data.prompts || [],
    categories: data.categories || [],
    settings: data.settings || {},
    exportDate: new Date().toISOString(),
    version: '1.0.0',
  };
  return JSON.stringify(exportData, null, 2);
}

// 触发下载（使用 downloads API）- 手动导出（带时间戳）
async function downloadExportFile(json: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  try {
    await chrome.downloads.download({
      url,
      filename: `promptmate-export-${Date.now()}.json`,
      saveAs: false,
      conflictAction: 'overwrite',
    } as any);
  } finally {
    // 延迟释放，确保下载发起
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

let autoExportTimer: number | undefined;
async function maybeAutoExport() {
  const data = await readLocal<any>(['settings']);
  const settings: Settings = data.settings || {};
  if (!settings.autoExportOnChange) return;
  // 防抖，避免一次批量写入触发多次下载
  if (autoExportTimer) clearTimeout(autoExportTimer);
  autoExportTimer = setTimeout(async () => {
    try {
      const json = await exportAllDataJSON();
      // 自动导出：固定路径，便于桌面端监控（Downloads/PromptMate/promptmate-sync.json）
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      try {
        await chrome.downloads.download({
          url,
          filename: `PromptMate/promptmate-sync.json`,
          saveAs: false,
          conflictAction: 'overwrite',
        } as any);
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
    } catch (e) {
      console.warn('自动导出失败:', e);
    }
  }, 600) as unknown as number;
}

// 初始化与重建菜单
chrome.runtime.onInstalled.addListener(async () => {
  console.log('PromptMate 扩展已安装');
  await buildContextMenus();
});

chrome.runtime.onStartup?.addListener(async () => {
  await buildContextMenus();
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'local') return;
  if (changes.prompts || changes.usageRecords || changes.categories) {
    await buildContextMenus();
  }
  // prompts、categories、settings 任一变化时尝试自动导出
  if (changes.prompts || changes.categories || changes.settings) {
    await maybeAutoExport();
  }
});

// 处理工具栏图标点击 - 打开侧边栏
chrome.action.onClicked.addListener((tab) => {
  console.log('工具栏图标被点击，打开侧边栏');
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('右键菜单被点击:', info);
  if (!tab?.id) return;

  if (info.menuItemId === 'promptmate-main' || info.menuItemId === 'pm-open-sidepanel') {
    chrome.sidePanel.open({ tabId: tab.id });
    return;
  }

  const id = String(info.menuItemId);
  if (id.startsWith('pm-inject:')) {
    const promptId = id.split(':')[1];
    readLocal<any>(['prompts']).then((data) => {
      const prompts: Prompt[] = data.prompts || [];
      const p = prompts.find(pp => pp.id === promptId);
      if (!p) return;
      chrome.tabs.sendMessage(tab.id!, { type: 'INJECT_TEXT', payload: { text: p.content } });
    });
  }
});

// 处理快捷键命令
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-promptmate') {
    console.log('快捷键触发，打开侧边栏');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    });
    return;
  }

  if (command === 'inject-last-prompt') {
    console.log('快捷键触发，直接注入最近使用的提示词');
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      const data = await readLocal<any>(['usageRecords', 'prompts']);
      const usage: UsageRecord[] = data.usageRecords || [];
      const prompts: Prompt[] = data.prompts || [];
      const last = [...usage]
        .filter(u => !!u.promptId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      if (!last) return;
      const p = prompts.find(pp => pp.id === last.promptId);
      if (!p) return;
      chrome.tabs.sendMessage(tabId, { type: 'INJECT_TEXT', payload: { text: p.content } });
    });
  }
});

// 处理消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('收到消息:', message);
  sendResponse({ success: true, message: 'PromptMate 演示版本' });
});