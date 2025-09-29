import React, { useEffect, useMemo, useState } from 'react';
import { mcpConfigStore, MCPEndpoint } from '@/services/promptx/MCPConfig';
import { MCPClient } from '@/services/promptx/MCPClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export const MCPSettingsPanel: React.FC = () => {
  const [endpoints, setEndpoints] = useState<MCPEndpoint[]>(mcpConfigStore.getEndpoints());
  const [activeId, setActiveId] = useState<string | null>(mcpConfigStore.getActiveId());
  const [testingId, setTestingId] = useState<string | null>(null);
  const active = useMemo(() => endpoints.find(e => e.id === activeId) || null, [endpoints, activeId]);

  useEffect(() => {
    // 强制重新加载配置以确保使用最新的端口设置
    mcpConfigStore.load();
    setEndpoints(mcpConfigStore.getEndpoints());
    setActiveId(mcpConfigStore.getActiveId());
  }, []);

  const handleSetActive = async (id: string) => {
    mcpConfigStore.setActive(id);
    setActiveId(id);
    const ep = mcpConfigStore.getActive();
    if (ep) {
      try { await MCPClient.connect(ep); toast.success('MCP endpoint switched'); } catch { toast.error('Connect failed'); }
    }
  };

  const handleAdd = () => {
    const id = `custom-${Date.now()}`;
    const ep: MCPEndpoint = { id, name: 'Custom Endpoint', type: 'remote', url: 'ws://127.0.0.1:5203/mcp', requiresAuth: false };
    mcpConfigStore.upsertEndpoint(ep);
    setEndpoints(mcpConfigStore.getEndpoints());
  };

  const handleRemove = (id: string) => {
    mcpConfigStore.removeEndpoint(id);
    setEndpoints(mcpConfigStore.getEndpoints());
    setActiveId(mcpConfigStore.getActiveId());
  };

  const handleUpdate = (id: string, patch: Partial<MCPEndpoint>) => {
    const cur = endpoints.find(e => e.id === id);
    if (!cur) return;
    mcpConfigStore.upsertEndpoint({ ...cur, ...patch });
    setEndpoints(mcpConfigStore.getEndpoints());
  };

  const handleTest = async (id: string) => {
    const ep = endpoints.find(e => e.id === id);
    if (!ep) return;
    
    setTestingId(id);
    try {
      console.log(`[MCPSettingsPanel] Testing endpoint: ${ep.name} (${ep.url})`);
      const res = await MCPClient.testConnection(ep);
      console.log(`[MCPSettingsPanel] Test result:`, res);
      
      if (res.ok) {
        toast.success(`连接成功: ${ep.name}`);
      } else {
        toast.error(`连接失败: ${res.error || 'unknown error'}`);
      }
    } catch (error: any) {
      console.error(`[MCPSettingsPanel] Test error:`, error);
      toast.error(`测试异常: ${error?.message || 'unknown'}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleExport = () => {
    try {
      const data = {
        endpoints,
        activeId,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'promptmate-mcp-config.json';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      toast.error('导出失败');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (Array.isArray(json.endpoints)) {
        // Replace all endpoints; keep simple for now
        json.endpoints.forEach((ep: MCPEndpoint) => mcpConfigStore.upsertEndpoint(ep));
      }
      if (json.activeId) mcpConfigStore.setActive(json.activeId);
      setEndpoints(mcpConfigStore.getEndpoints());
      setActiveId(mcpConfigStore.getActiveId());
      toast.success('已导入MCP配置');
    } catch (e: any) {
      toast.error(`导入失败: ${e?.message || 'unknown'}`);
    }
  };

  const importInputId = 'mcp-import-json-input';

  const handleClearCache = () => {
    localStorage.removeItem('promptx_mcp_endpoints_v1');
    localStorage.removeItem('promptx_mcp_active_endpoint_v1');
    mcpConfigStore.load();
    setEndpoints(mcpConfigStore.getEndpoints());
    setActiveId(mcpConfigStore.getActiveId());
    toast.success('已清除MCP配置缓存并重置为默认设置');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">MCP 端点</h3>
          <div className="text-xs text-muted-foreground mt-1">本地服务由用户自行启动，例如：npx @promptx/mcp-server --transport http --port 5204 --cors</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleClearCache}>重置配置</Button>
          <Button variant="outline" size="sm" onClick={handleExport}>导出JSON</Button>
          <label htmlFor={importInputId} className="inline-block">
            <input id={importInputId} type="file" accept="application/json" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.currentTarget.value = '';
            }} />
            <Button variant="outline" size="sm" asChild={false} onClick={() => {
              const el = document.getElementById(importInputId) as HTMLInputElement | null;
              el?.click();
            }}>导入JSON</Button>
          </label>
          <Button size="sm" onClick={handleAdd}>新增端点</Button>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        {endpoints.map((ep) => (
          <div key={ep.id} className={`rounded-lg border p-3 space-y-3 ${activeId===ep.id ? 'border-primary' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{ep.name}</div>
              <div className="flex gap-2">
                <Button variant={activeId===ep.id ? 'default' : 'outline'} size="sm" onClick={() => handleSetActive(ep.id)}>
                  {activeId===ep.id ? '当前' : '设为当前'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleTest(ep.id)}
                  disabled={testingId === ep.id}
                >
                  {testingId === ep.id ? '测试中...' : '测试'}
                </Button>
                {ep.id !== 'local-managed' && (
                  <Button variant="outline" size="sm" onClick={() => handleRemove(ep.id)}>删除</Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <Label className="text-xs">URL</Label>
                <Input value={ep.url} onChange={(e) => handleUpdate(ep.id, { url: e.target.value })} />
              </div>
              {ep.type === 'managed-local' && (
                <div className="text-xs text-muted-foreground">本地托管端点（无需鉴权，启动时自动连接）</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
