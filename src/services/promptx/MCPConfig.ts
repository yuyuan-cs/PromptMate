export type MCPEndpoint = {
  id: string;
  name: string;
  type: 'managed-local' | 'remote';
  url: string; // e.g. ws://127.0.0.1:8787
  command?: string; // for managed-local
  args?: string[];
  cwd?: string;
  requiresAuth?: boolean; // default false for local
  autoStart?: boolean; // only for managed-local
};

const LS_KEY = 'promptx_mcp_endpoints_v1';
const ACTIVE_KEY = 'promptx_mcp_active_endpoint_v1';

function defaultEndpoints(): MCPEndpoint[] {
  return [
    {
      id: 'local-managed',
      name: 'Local MCP (Managed)',
      type: 'managed-local',
      url: 'http://127.0.0.1:5204/mcp',
      command: 'npx',
      args: ['@promptx/mcp-server', '--transport', 'http', '--port', '5204', '--cors'],
      cwd: undefined,
      requiresAuth: false,
      autoStart: true,
    },
  ];
}

export class MCPConfigStore {
  private _endpoints: MCPEndpoint[] = [];
  private _activeId: string | null = null;

  constructor() {
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const active = localStorage.getItem(ACTIVE_KEY);
      if (raw) {
        this._endpoints = JSON.parse(raw);
        // 强制更新默认端点的URL到新端口
        const defaultEp = this._endpoints.find(e => e.id === 'local-managed');
        if (defaultEp && (defaultEp.url.includes(':5203') || defaultEp.url === 'http://127.0.0.1:5204')) {
          defaultEp.url = 'http://127.0.0.1:5204/mcp';
          defaultEp.args = ['@promptx/mcp-server', '--transport', 'http', '--port', '5204', '--cors'];
          this.save(); // 保存更新
        }
      }
      if (!raw) this._endpoints = defaultEndpoints();
      this._activeId = active || this._endpoints[0]?.id || null;
    } catch {
      this._endpoints = defaultEndpoints();
      this._activeId = this._endpoints[0]?.id || null;
    }
  }

  save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(this._endpoints));
      if (this._activeId) localStorage.setItem(ACTIVE_KEY, this._activeId);
    } catch {}
  }

  getEndpoints() { return this._endpoints.slice(); }
  getActiveId() { return this._activeId; }
  getActive(): MCPEndpoint | null { return this._endpoints.find(e => e.id === this._activeId) || null; }

  setActive(id: string) {
    this._activeId = id;
    this.save();
  }

  upsertEndpoint(ep: MCPEndpoint) {
    const idx = this._endpoints.findIndex(e => e.id === ep.id);
    if (idx >= 0) this._endpoints[idx] = ep; else this._endpoints.push(ep);
    this.save();
  }

  removeEndpoint(id: string) {
    this._endpoints = this._endpoints.filter(e => e.id !== id);
    if (this._activeId === id) this._activeId = this._endpoints[0]?.id || null;
    this.save();
  }
}

export const mcpConfigStore = new MCPConfigStore();
