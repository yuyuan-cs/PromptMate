import { Prompt, Category, Settings } from './types';

export interface SyncData {
  version: string;
  lastModified: string;
  prompts: Prompt[];
  categories: Category[];
  settings: Settings;
  syncMetadata: {
    source: 'desktop' | 'extension';
    checksum: string;
  };
}

export interface SyncStatus {
  connected: boolean;
  lastSync: string | null;
  hasConflicts: boolean;
  error: string | null;
}

export class SyncClient {
  private static instance: SyncClient;
  private port: chrome.runtime.Port | null = null;
  private isConnected = false;
  private listeners: Map<string, Function[]> = new Map();
  private syncInterval: number | null = null;

  private constructor() {
    this.setupNativeMessaging();
  }

  public static getInstance(): SyncClient {
    if (!SyncClient.instance) {
      SyncClient.instance = new SyncClient();
    }
    return SyncClient.instance;
  }

  // 设置 Native Messaging 连接
  private setupNativeMessaging(): void {
    try {
      this.port = chrome.runtime.connectNative('com.promptmate.sync');
      
      this.port.onMessage.addListener((message) => {
        this.handleNativeMessage(message);
      });

      this.port.onDisconnect.addListener(() => {
        this.isConnected = false;
        this.emit('disconnected', chrome.runtime.lastError);
        
        // 尝试重连
        setTimeout(() => {
          this.setupNativeMessaging();
        }, 5000);
      });

      this.isConnected = true;
      this.emit('connected');
    } catch (error) {
      console.error('Native Messaging 连接失败:', error);
      this.isConnected = false;
      this.emit('error', error);
    }
  }

  // 处理来自 Native Host 的消息
  private handleNativeMessage(message: any): void {
    switch (message.type) {
      case 'dataChanged':
        this.emit('dataChanged', message.data);
        break;
      case 'syncComplete':
        this.emit('syncComplete', message.data);
        break;
      case 'conflictDetected':
        this.emit('conflictDetected', message.data);
        break;
      case 'error':
        this.emit('error', new Error(message.error));
        break;
      default:
        console.warn('未知的 Native 消息类型:', message.type);
    }
  }

  // 事件监听器管理
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('事件回调执行失败:', error);
        }
      });
    }
  }

  // 发送消息到 Native Host
  private sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.port) {
        reject(new Error('Native Host 未连接'));
        return;
      }

      const messageId = Date.now().toString();
      const messageWithId = { ...message, id: messageId };

      // 设置响应监听器
      const responseHandler = (response: any) => {
        if (response.id === messageId) {
          this.port!.onMessage.removeListener(responseHandler);
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.data);
          }
        }
      };

      this.port.onMessage.addListener(responseHandler);
      this.port.postMessage(messageWithId);

      // 设置超时
      setTimeout(() => {
        this.port!.onMessage.removeListener(responseHandler);
        reject(new Error('请求超时'));
      }, 10000);
    });
  }

  // 读取同步数据
  async readSyncData(): Promise<SyncData | null> {
    try {
      const data = await this.sendMessage({
        type: 'readSyncData'
      });
      return data;
    } catch (error) {
      console.error('读取同步数据失败:', error);
      return null;
    }
  }

  // 写入同步数据
  async writeSyncData(prompts: Prompt[], categories: Category[], settings: Settings): Promise<void> {
    try {
      const syncData: Omit<SyncData, 'syncMetadata'> = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        prompts,
        categories,
        settings
      };

      await this.sendMessage({
        type: 'writeSyncData',
        data: {
          ...syncData,
          syncMetadata: {
            source: 'extension',
            checksum: this.calculateChecksum(syncData)
          }
        }
      });

      this.emit('dataSynced');
    } catch (error) {
      console.error('写入同步数据失败:', error);
      this.emit('error', error);
      throw error;
    }
  }

  // 计算校验和
  private calculateChecksum(data: Omit<SyncData, 'syncMetadata'>): string {
    const content = JSON.stringify({
      prompts: data.prompts,
      categories: data.categories,
      settings: data.settings
    });
    
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  // 检查连接状态
  isNativeHostConnected(): boolean {
    return this.isConnected;
  }

  // 获取同步状态
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const status = await this.sendMessage({
        type: 'getSyncStatus'
      });
      return {
        connected: this.isConnected,
        ...status
      };
    } catch (error) {
      return {
        connected: this.isConnected,
        lastSync: null,
        hasConflicts: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 手动触发同步
  async manualSync(): Promise<void> {
    try {
      await this.sendMessage({
        type: 'manualSync'
      });
    } catch (error) {
      console.error('手动同步失败:', error);
      throw error;
    }
  }

  // 启动自动同步
  startAutoSync(intervalSeconds: number = 30): void {
    this.stopAutoSync();
    
    this.syncInterval = window.setInterval(async () => {
      try {
        const syncData = await this.readSyncData();
        if (syncData) {
          this.emit('autoSyncData', syncData);
        }
      } catch (error) {
        console.error('自动同步失败:', error);
      }
    }, intervalSeconds * 1000);
  }

  // 停止自动同步
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // 解决冲突
  async resolveConflict(resolution: 'local' | 'remote' | 'merge', localData?: SyncData): Promise<void> {
    try {
      await this.sendMessage({
        type: 'resolveConflict',
        data: {
          resolution,
          localData
        }
      });
    } catch (error) {
      console.error('解决冲突失败:', error);
      throw error;
    }
  }

  // 销毁客户端
  destroy(): void {
    this.stopAutoSync();
    
    if (this.port) {
      this.port.disconnect();
      this.port = null;
    }
    
    this.isConnected = false;
    this.listeners.clear();
  }
}
