/**
 * PromptMate 设置页面组件 - 演示版本
 */

import React from 'react';

export const Options: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9fafb'
    }}>
      <h1 style={{ color: '#1f2937', marginBottom: '20px' }}>PromptMate 设置</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>
        配置您的浏览器扩展偏好设置
      </p>
      
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ color: '#374151', marginBottom: '15px' }}>基本设置</h3>
        <p style={{ color: '#6b7280', margin: 0 }}>
          设置页面开发中，敬请期待...
        </p>
      </div>
    </div>
  );
};