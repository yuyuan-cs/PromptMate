/**
 * PromptMate 浏览器扩展背景脚本 - 简化版本
 */

console.log('PromptMate 背景脚本已启动');

// 扩展安装时的初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('PromptMate 扩展已安装');
  
  // 创建右键菜单
  chrome.contextMenus.create({
    id: 'promptmate-main',
    title: 'PromptMate',
    contexts: ['all']
  });
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
  if (info.menuItemId === 'promptmate-main' && tab?.id) {
    chrome.sidePanel.open({ tabId: tab.id });
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
  }
});

// 处理消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('收到消息:', message);
  sendResponse({ success: true, message: 'PromptMate 演示版本' });
});