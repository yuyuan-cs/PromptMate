/**
 * PromptMate 主弹窗入口文件
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

const Popup: React.FC = () => {
  return (
    <div style={{ 
      width: '400px', 
      height: '600px', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff'
    }}>
      <h1 style={{ color: '#1f2937', marginBottom: '20px', fontSize: '24px' }}>PromptMate</h1>
      <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
        浏览器扩展演示版本
      </p>
      
      <div style={{ 
        background: '#f3f4f6', 
        padding: '15px', 
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
          ✨ 即将为您带来强大的提示词管理功能
        </p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button 
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          onClick={() => {
            chrome.runtime.openOptionsPage();
          }}
        >
          打开设置页面
        </button>
      </div>

      <div style={{ marginTop: '15px' }}>
        <button 
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          onClick={() => {
            // 演示文本注入功能
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: 'INJECT_TEXT',
                  payload: { text: '这是来自PromptMate的演示文本！' }
                });
              }
            });
          }}
        >
          演示文本注入
        </button>
      </div>
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