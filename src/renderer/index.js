import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.js';
import './index.css';

// 从主进程获取初始设置
const { ipcRenderer } = window.require('electron');

// 获取初始设置
async function initApp() {
  console.log('初始化应用');
  try {
    // 获取应用设置
    const settings = await ipcRenderer.invoke('get-settings');
    
    // 根据设置应用主题
    document.documentElement.setAttribute('data-theme', settings.theme);
    
    // 根据设置应用字体
    if (settings.font) {
      document.documentElement.style.fontFamily = settings.font;
    }
    
    // 根据设置应用字体大小
    if (settings.fontSize) {
      document.documentElement.style.fontSize = `${settings.fontSize}px`;
    }
    
    // 渲染应用
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(
      <HashRouter>
        <App initialSettings={settings} />
      </HashRouter>
    );
  } catch (error) {
    console.error('初始化应用失败:', error);
    // 回退到默认设置
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(
      <HashRouter>
        <App initialSettings={{
          theme: 'light',
          font: 'system-ui',
          fontSize: 14,
          alwaysOnTop: false
        }} />
      </HashRouter>
    );
  }
}

// 初始化应用
initApp(); 