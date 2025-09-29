import { MCPEndpoint, mcpConfigStore } from './MCPConfig';

type StatusListener = (status: { connected: boolean; url?: string; error?: string }) => void;

class MCPClientImpl {
  private ws: WebSocket | null = null;
  private currentEndpoint: MCPEndpoint | null = null;
  private listeners = new Set<StatusListener>();

  getEndpoint() {
    return this.currentEndpoint;
  }

  onStatusChange(listener: StatusListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(status: { connected: boolean; url?: string; error?: string }) {
    this.listeners.forEach(l => l(status));
  }

  async connect(endpoint?: MCPEndpoint): Promise<void> {
    if (this.ws) this.disconnect();
    this.currentEndpoint = endpoint || mcpConfigStore.getActive();
    if (!this.currentEndpoint) throw new Error('No MCP endpoint configured');

    const url = this.currentEndpoint.url;
    // If http(s), try mapping to ws(s) for WebSocket connection
    const wsUrl = url.startsWith('http://')
      ? 'ws://' + url.slice('http://'.length)
      : url.startsWith('https://')
        ? 'wss://' + url.slice('https://'.length)
        : url;
    await new Promise<void>((resolve, reject) => {
      try {
        const ws = new WebSocket(wsUrl);
        this.ws = ws;
        ws.onopen = () => {
          this.emit({ connected: true, url: wsUrl });
          resolve();
        };
        ws.onclose = () => {
          this.emit({ connected: false, url: wsUrl });
          this.ws = null;
        };
        ws.onerror = (ev) => {
          this.emit({ connected: false, url: wsUrl, error: 'WebSocket error' });
          reject(new Error('WebSocket error'));
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    if (this.currentEndpoint) this.emit({ connected: false, url: this.currentEndpoint.url });
  }

  async testConnection(endpoint?: MCPEndpoint): Promise<{ ok: boolean; error?: string }> {
    const ep = endpoint || mcpConfigStore.getActive();
    if (!ep) return { ok: false, error: 'No endpoint configured' };
    
    const url = ep.url;
    console.log(`[MCP] Testing connection to: ${url}`);
    
    // For HTTP endpoints, send a valid JSON-RPC request to test.
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'mcp.discover',
            params: {},
            id: `test-${Date.now()}`,
          }),
        });

        // A valid JSON-RPC server should respond, even with an error.
        // Any response that is valid JSON is a success.
        await response.json();
        return { ok: true };
      } catch (e: any) {
        console.error(`[MCP] HTTP test failed:`, e);
        return { ok: false, error: e?.message || 'HTTP connection failed' };
      }
    }
    
    // WebSocket test
    return new Promise((resolve) => {
      let ws: WebSocket | null = null;
      try {
        console.log(`[MCP] Testing WebSocket connection to: ${url}`);
        ws = new WebSocket(url);
        const timer = setTimeout(() => {
          console.log(`[MCP] WebSocket test timeout`);
          try { ws?.close(); } catch {}
          resolve({ ok: false, error: 'Connection timeout (4s)' });
        }, 4000);
        
        ws.onopen = () => {
          console.log(`[MCP] WebSocket test successful`);
          clearTimeout(timer);
          try { ws?.close(); } catch {}
          resolve({ ok: true });
        };
        
        ws.onerror = (event) => {
          console.error(`[MCP] WebSocket test error:`, event);
          clearTimeout(timer);
          try { ws?.close(); } catch {}
          resolve({ ok: false, error: 'WebSocket connection failed' });
        };
        
        ws.onclose = (event) => {
          console.log(`[MCP] WebSocket closed during test: ${event.code} ${event.reason}`);
          clearTimeout(timer);
          if (event.code !== 1000) {
            resolve({ ok: false, error: `WebSocket closed: ${event.code} ${event.reason}` });
          }
        };
      } catch (e: any) {
        console.error(`[MCP] WebSocket test exception:`, e);
        try { ws?.close(); } catch {}
        resolve({ ok: false, error: e?.message || 'WebSocket test failed' });
      }
    });
  }

  // Placeholder for future feature
  async discover(): Promise<{ roles: string[]; tools: string[] }> {
    return { roles: [], tools: [] };
  }
}

export const MCPClient = new MCPClientImpl();
