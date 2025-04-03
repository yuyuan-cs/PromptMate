import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Sidebar';
import Layout from './components/Layout';
import './App.css';

const { ipcRenderer } = window.require('electron');

function App({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加载所有提示语
  useEffect(() => {
    async function loadPrompts() {
      try {
        const data = await ipcRenderer.invoke('get-prompts');
        setPrompts(data.prompts || []);
      } catch (error) {
        console.error('加载提示语失败:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPrompts();
  }, []);

  // 保存设置
  const saveSettings = async (newSettings) => {
    try {
      const result = await ipcRenderer.invoke('save-settings', newSettings);
      if (result.success) {
        setSettings(newSettings);
        
        // 应用主题
        document.documentElement.setAttribute('data-theme', newSettings.theme);
        
        // 应用字体
        if (newSettings.font) {
          document.documentElement.style.fontFamily = newSettings.font;
        }
        
        // 应用字体大小
        if (newSettings.fontSize) {
          document.documentElement.style.fontSize = `${newSettings.fontSize}px`;
        }
        
        // 应用窗口置顶设置
        if (newSettings.alwaysOnTop !== undefined) {
          ipcRenderer.send('toggle-pin-window', newSettings.alwaysOnTop);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('保存设置失败:', error);
      return false;
    }
  };

  // 保存提示语
  const savePrompts = async (updatedPrompts) => {
    try {
      const data = { prompts: updatedPrompts };
      const result = await ipcRenderer.invoke('save-prompts', data);
      if (result.success) {
        setPrompts(updatedPrompts);
        return true;
      }
      return false;
    } catch (error) {
      console.error('保存提示语失败:', error);
      return false;
    }
  };

  return (
    <Layout settings={initialSettings}>
      <Routes>
        <Route path="/" element={<HomePage prompts={prompts} savePrompts={savePrompts} />} />
        <Route path="/favorites" element={<FavoritesPage prompts={prompts} savePrompts={savePrompts} />} />
        <Route path="/categories" element={<CategoriesPage prompts={prompts} savePrompts={savePrompts} />} />
        <Route path="/settings" element={<SettingsPage settings={settings} saveSettings={saveSettings} />} />
      </Routes>
    </Layout>
  );
}

export default App; 