import React, { useState } from 'react';
import './SettingsPage.css';

const { ipcRenderer } = window.require('electron');
const { dialog } = window.require('@electron/remote');

function SettingsPage({ settings, saveSettings }) {
  const [formValues, setFormValues] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState({ show: false, success: false, message: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveResult({ show: false, success: false, message: '' });

    try {
      const result = await saveSettings(formValues);
      
      if (result) {
        setSaveResult({
          show: true,
          success: true,
          message: '设置保存成功'
        });
      } else {
        setSaveResult({
          show: true,
          success: false,
          message: '设置保存失败，请重试'
        });
      }
    } catch (error) {
      setSaveResult({
        show: true,
        success: false,
        message: `保存设置时出错: ${error.message}`
      });
    } finally {
      setSaving(false);
      
      // 3秒后隐藏保存结果提示
      setTimeout(() => {
        setSaveResult(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  // 导出数据
  const handleExportData = async () => {
    try {
      // 获取所有提示语数据
      const data = await ipcRenderer.invoke('get-prompts');
      
      // 打开保存对话框
      const { filePath } = await dialog.showSaveDialog({
        title: '导出提示语',
        defaultPath: 'promptmate_data.json',
        filters: [
          { name: 'JSON文件', extensions: ['json'] }
        ]
      });
      
      if (filePath) {
        // 执行导出操作
        const result = await ipcRenderer.invoke('export-data', filePath, data);
        if (result.success) {
          setSaveResult({
            show: true,
            success: true,
            message: '数据导出成功'
          });
        } else {
          setSaveResult({
            show: true,
            success: false,
            message: `导出失败: ${result.error}`
          });
        }
      }
    } catch (error) {
      setSaveResult({
        show: true,
        success: false,
        message: `导出数据时出错: ${error.message}`
      });
    }
    
    // 3秒后隐藏消息
    setTimeout(() => {
      setSaveResult(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // 导入数据
  const handleImportData = async () => {
    try {
      // 打开文件选择对话框
      const { filePaths } = await dialog.showOpenDialog({
        title: '导入提示语',
        filters: [
          { name: 'JSON文件', extensions: ['json'] }
        ],
        properties: ['openFile']
      });
      
      if (filePaths && filePaths.length > 0) {
        // 执行导入操作
        const result = await ipcRenderer.invoke('import-data', filePaths[0]);
        if (result.success) {
          setSaveResult({
            show: true,
            success: true,
            message: '数据导入成功'
          });
        } else {
          setSaveResult({
            show: true,
            success: false,
            message: `导入失败: ${result.error}`
          });
        }
      }
    } catch (error) {
      setSaveResult({
        show: true,
        success: false,
        message: `导入数据时出错: ${error.message}`
      });
    }
    
    // 3秒后隐藏消息
    setTimeout(() => {
      setSaveResult(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // 重置所有设置
  const handleResetSettings = async () => {
    // 确认是否重置
    const confirmResult = await dialog.showMessageBox({
      type: 'warning',
      title: '重置设置',
      message: '确定要重置所有设置吗？',
      detail: '此操作将恢复所有设置为默认值，但不会删除您的提示语数据。',
      buttons: ['取消', '重置'],
      defaultId: 0,
      cancelId: 0
    });
    
    // 如果用户确认
    if (confirmResult.response === 1) {
      try {
        // 恢复默认设置
        const defaultSettings = {
          theme: 'light',
          font: 'system-ui',
          fontSize: 14,
          alwaysOnTop: false
        };
        
        // 保存默认设置
        const result = await saveSettings(defaultSettings);
        
        if (result) {
          // 更新表单值
          setFormValues(defaultSettings);
          
          setSaveResult({
            show: true,
            success: true,
            message: '设置已重置'
          });
        } else {
          setSaveResult({
            show: true,
            success: false,
            message: '设置重置失败，请重试'
          });
        }
      } catch (error) {
        setSaveResult({
          show: true,
          success: false,
          message: `重置设置时出错: ${error.message}`
        });
      }
      
      // 3秒后隐藏消息
      setTimeout(() => {
        setSaveResult(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>设置</h2>
      </div>
      
      <div className="settings-container">
        <div className="settings-section">
          <h3 className="section-title">外观</h3>
          
          <div className="settings-row">
            <label htmlFor="theme">主题</label>
            <select 
              id="theme" 
              name="theme" 
              value={formValues.theme} 
              onChange={handleChange}
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="system">跟随系统</option>
            </select>
          </div>
          
          <div className="settings-row">
            <label htmlFor="font">字体</label>
            <select 
              id="font" 
              name="font" 
              value={formValues.font} 
              onChange={handleChange}
            >
              <option value="system-ui">系统默认</option>
              <option value="'PingFang SC', sans-serif">苹方</option>
              <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
              <option value="'Segoe UI', sans-serif">Segoe UI</option>
              <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica</option>
            </select>
          </div>
          
          <div className="settings-row">
            <label htmlFor="fontSize">字体大小</label>
            <div className="font-size-control">
              <input 
                type="range" 
                id="fontSize" 
                name="fontSize" 
                min="12" 
                max="20" 
                step="1" 
                value={formValues.fontSize} 
                onChange={handleChange}
              />
              <span className="font-size-value">{formValues.fontSize}px</span>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">窗口</h3>
          
          <div className="settings-row">
            <label htmlFor="alwaysOnTop">窗口置顶</label>
            <div className="toggle-control">
              <input 
                type="checkbox" 
                id="alwaysOnTop" 
                name="alwaysOnTop" 
                checked={formValues.alwaysOnTop} 
                onChange={handleChange}
              />
              <label htmlFor="alwaysOnTop" className="toggle-label"></label>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">数据</h3>
          
          <div className="settings-row">
            <button className="secondary-button" onClick={handleExportData}>导出数据</button>
            <button className="secondary-button" onClick={handleImportData}>导入数据</button>
          </div>
          
          <div className="settings-row">
            <button className="danger-button" onClick={handleResetSettings}>重置所有设置</button>
          </div>
        </div>
      </div>
      
      <div className="settings-footer">
        <button 
          className="save-button" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存设置'}
        </button>
        
        {saveResult.show && (
          <div className={`save-result ${saveResult.success ? 'success' : 'error'}`}>
            {saveResult.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage; 