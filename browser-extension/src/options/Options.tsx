/**
 * PromptMate 设置页面组件 - 演示版本
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useExtensionPrompts } from '../hooks/useExtensionPrompts';
import { Settings } from '../shared/types';

export const Options: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    refreshData,
  } = useExtensionPrompts();

  const [local, setLocal] = useState<Settings | null>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setLocal(settings);
  }, [settings]);

  const handleChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (!local) return;
    setLocal({ ...local, [key]: value });
  };

  const handleSave = async () => {
    if (!local) return;
    await updateSettings(local);
    setMessage('设置已保存');
    setTimeout(() => setMessage(null), 2000);
  };

  const allowListText = useMemo(() => (local?.allowList || []).join('\n'), [local]);
  const blockListText = useMemo(() => (local?.blockList || []).join('\n'), [local]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '24px 32px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9fafb'
    }}>
      <h1 style={{ color: '#111827', marginBottom: 4 }}>PromptMate 设置</h1>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>配置您的浏览器扩展偏好设置</p>

      {message && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '8px 12px',
          borderRadius: 6,
          marginBottom: 12,
          display: 'inline-block'
        }}>{message}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3 style={{ margin: '0 0 12px', color: '#111827' }}>外观与行为</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#374151', fontSize: 14 }}>主题</span>
              <select
                value={local?.theme || 'auto'}
                onChange={(e) => handleChange('theme', e.target.value as Settings['theme'])}
                style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: 6 }}
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="auto">自动</option>
              </select>
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#374151', fontSize: 14 }}>字体大小</span>
              <input
                type="number"
                min={12}
                max={20}
                value={local?.fontSize ?? 14}
                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: 6 }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!local?.autoInject}
                onChange={(e) => handleChange('autoInject', e.target.checked)}
              /> 自动注入（支持时）
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!local?.showNotifications}
                onChange={(e) => handleChange('showNotifications', e.target.checked)}
              /> 显示操作提示
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!local?.enableShortcuts}
                onChange={(e) => handleChange('enableShortcuts', e.target.checked)}
              /> 启用快捷键
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!local?.compactMode}
                onChange={(e) => handleChange('compactMode', e.target.checked)}
              /> 紧凑模式
            </label>
          </div>
        </section>

        <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3 style={{ margin: '0 0 12px', color: '#111827' }}>数据与同步</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!local?.autoExportOnChange}
                onChange={(e) => handleChange('autoExportOnChange', e.target.checked as unknown as Settings['autoExportOnChange'])}
              />
              变更时自动导出数据（将下载JSON文件）
            </label>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={async () => {
                  const data = await exportData();
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `promptmate-export-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb' }}
              >导出数据</button>

              <label style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb', cursor: 'pointer' }}>
                {importing ? '导入中...' : '导入数据'}
                <input
                  type="file"
                  accept="application/json"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImporting(true);
                    try {
                      const text = await file.text();
                      await importData(text);
                      await refreshData();
                      setMessage('导入成功');
                      setTimeout(() => setMessage(null), 2000);
                    } finally {
                      setImporting(false);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </label>

              <button
                onClick={async () => {
                  if (confirm('确定清空所有扩展数据吗？此操作不可撤销。')) {
                    await clearAllData();
                    await refreshData();
                    setMessage('已清空所有数据');
                    setTimeout(() => setMessage(null), 2000);
                  }
                }}
                style={{ padding: '8px 12px', border: '1px solid #ef4444', color: '#991b1b', borderRadius: 6, background: '#fff7ed' }}
              >清空数据</button>
            </div>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#374151', fontSize: 14 }}>默认分类</span>
              <input
                type="text"
                value={local?.defaultCategory ?? ''}
                onChange={(e) => handleChange('defaultCategory', e.target.value)}
                placeholder="如：general"
                style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: 6 }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#374151', fontSize: 14 }}>历史记录保留条数</span>
              <input
                type="number"
                min={10}
                max={500}
                value={local?.maxHistory ?? 50}
                onChange={(e) => handleChange('maxHistory', Number(e.target.value))}
                style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: 6 }}
              />
            </label>
          </div>
        </section>

        <section style={{ gridColumn: '1 / span 2', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3 style={{ margin: '0 0 12px', color: '#111827' }}>站点控制（黑/白名单）</h3>
          <p style={{ color: '#6b7280', marginTop: 0, marginBottom: 8, fontSize: 13 }}>
            若填写白名单，则仅在列表中的域名启用注入；否则按黑名单排除。每行一个域名，支持二级域名（如 example.com 或 sub.example.com）。
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#374151', fontSize: 14 }}>白名单（allowList）</span>
              <textarea
                rows={8}
                value={allowListText}
                onChange={(e) => handleChange('allowList', e.target.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean))}
                placeholder={'如：\nchat.openai.com\nclaude.ai\nmail.google.com'}
                style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: 6, fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#374151', fontSize: 14 }}>黑名单（blockList）</span>
              <textarea
                rows={8}
                value={blockListText}
                onChange={(e) => handleChange('blockList', e.target.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean))}
                placeholder={'如：\nexample.com\ninternal.company.com'}
                style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: 6, fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </section>
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleSave}
          style={{ padding: '10px 16px', background: '#111827', color: '#fff', borderRadius: 8, border: 'none' }}
        >保存设置</button>
      </div>
    </div>
  );
};