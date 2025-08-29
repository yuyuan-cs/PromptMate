/**
 * PromptMate 主弹窗入口文件 - 简化版本
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

const Popup: React.FC = () => {
  return (
    <div style={{ 
      width: '300px', 
      height: '200px', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '20px' }}>PromptMate</h1>
      <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px', lineHeight: '1.4' }}>
        点击扩展图标打开侧边栏<br/>
        使用完整的提示词管理功能
      </p>
      
      <button 
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '8px'
        }}
        onClick={async () => {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab?.id) {
            chrome.sidePanel.open({ tabId: tab.id });
            window.close();
          }
        }}
      >
        打开侧边栏
      </button>

    </div>
  );
};

// 确保DOM加载完成后再渲染
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<Popup />);
  }
});