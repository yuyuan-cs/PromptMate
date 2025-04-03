import React from 'react';
import './Settings.css';

function Settings() {
  return (
    <div className="settings">
      <h1>设置</h1>
      <div className="settings-section">
        <h2>外观</h2>
        <div className="setting-item">
          <label>主题</label>
          <select>
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>
        <div className="setting-item">
          <label>字体</label>
          <select>
            <option value="system-ui">系统默认</option>
            <option value="Arial">Arial</option>
            <option value="Microsoft YaHei">微软雅黑</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Settings; 