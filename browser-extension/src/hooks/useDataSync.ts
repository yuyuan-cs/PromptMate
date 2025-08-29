import * as React from 'react';
import { SyncClient, SyncData, SyncStatus } from '../shared/syncClient';
import { StorageManager } from '../shared/storage';
import { Prompt, Category, Settings } from '../shared/types';

export interface SyncConflict {
  localData: SyncData;
  remoteData: SyncData;
  timestamp: string;
}

export const useDataSync = () => {
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>({
    connected: false,
    lastSync: null,
    hasConflicts: false,
    error: null
  });
  
  const [pendingConflict, setPendingConflict] = React.useState<SyncConflict | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  const syncClient = React.useMemo(() => SyncClient.getInstance(), []);
  const storage = React.useMemo(() => StorageManager.getInstance(), []);

  // 初始化同步客户端
  React.useEffect(() => {
    const initializeSync = async () => {
      try {
        // 设置事件监听器
        setupEventListeners();
        
        // 获取初始同步状态
        const status = await syncClient.getSyncStatus();
        setSyncStatus(status);
        
        // 启动自动同步
        if (status.connected) {
          syncClient.startAutoSync(30); // 30秒间隔
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('同步初始化失败:', error);
        setSyncStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '同步初始化失败'
        }));
        setIsInitialized(true);
      }
    };

    initializeSync();

    return () => {
      syncClient.destroy();
    };
  }, []);

  // 设置事件监听器
  const setupEventListeners = React.useCallback(() => {
    // 连接状态变化
    syncClient.on('connected', () => {
      setSyncStatus(prev => ({ ...prev, connected: true, error: null }));
      syncClient.startAutoSync(30);
    });

    syncClient.on('disconnected', (error: any) => {
      setSyncStatus(prev => ({
        ...prev,
        connected: false,
        error: error ? error.message : '连接断开'
      }));
    });

    // 数据变更事件
    syncClient.on('dataChanged', async (syncData: SyncData) => {
      try {
        // 检测冲突
        const localData = await createCurrentSyncData();
        const hasConflict = await detectConflict(localData, syncData);
        
        if (hasConflict) {
          // 显示冲突解决界面
          setPendingConflict({
            localData,
            remoteData: syncData,
            timestamp: new Date().toISOString()
          });
          
          setSyncStatus(prev => ({ ...prev, hasConflicts: true }));
        } else {
          // 自动应用远程数据
          await applyRemoteData(syncData);
          setSyncStatus(prev => ({ 
            ...prev, 
            lastSync: new Date().toISOString(),
            error: null
          }));
        }
      } catch (error) {
        console.error('处理数据变更失败:', error);
        setSyncStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '数据同步失败'
        }));
      }
    });

    // 自动同步数据事件
    syncClient.on('autoSyncData', async (syncData: SyncData) => {
      try {
        const localData = await createCurrentSyncData();
        
        // 比较校验和，如果不同则更新本地数据
        if (localData.syncMetadata.checksum !== syncData.syncMetadata.checksum) {
          await applyRemoteData(syncData);
          setSyncStatus(prev => ({ 
            ...prev, 
            lastSync: new Date().toISOString(),
            error: null
          }));
        }
      } catch (error) {
        console.error('自动同步处理失败:', error);
      }
    });

    // 同步完成事件
    syncClient.on('dataSynced', () => {
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        error: null
      }));
    });

    // 冲突检测事件
    syncClient.on('conflictDetected', ({ localData, remoteData }: { localData: SyncData, remoteData: SyncData }) => {
      setPendingConflict({
        localData,
        remoteData,
        timestamp: new Date().toISOString()
      });
      
      setSyncStatus(prev => ({ ...prev, hasConflicts: true }));
    });

    // 错误事件
    syncClient.on('error', (error: Error) => {
      setSyncStatus(prev => ({
        ...prev,
        error: error.message
      }));
    });
  }, [syncClient]);

  // 创建当前数据的同步格式
  const createCurrentSyncData = React.useCallback(async (): Promise<SyncData> => {
    const prompts = await storage.getPrompts();
    const categories = await storage.getCategories();
    const settings = await storage.getSettings();
    
    const syncData: Omit<SyncData, 'syncMetadata'> = {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      prompts,
      categories,
      settings
    };

    return {
      ...syncData,
      syncMetadata: {
        source: 'extension',
        checksum: calculateChecksum(syncData)
      }
    };
  }, [storage]);

  // 计算校验和
  const calculateChecksum = React.useCallback((data: Omit<SyncData, 'syncMetadata'>): string => {
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
  }, []);

  // 检测数据冲突
  const detectConflict = React.useCallback(async (localData: SyncData, remoteData: SyncData): Promise<boolean> => {
    // 比较校验和
    if (localData.syncMetadata.checksum === remoteData.syncMetadata.checksum) {
      return false;
    }

    // 比较修改时间
    const localTime = new Date(localData.lastModified).getTime();
    const remoteTime = new Date(remoteData.lastModified).getTime();
    
    // 如果时间差小于1秒，认为是冲突
    return Math.abs(localTime - remoteTime) < 1000;
  }, []);

  // 应用远程数据
  const applyRemoteData = React.useCallback(async (syncData: SyncData) => {
    try {
      await storage.savePrompts(syncData.prompts);
      await storage.saveCategories(syncData.categories);
      await storage.saveSettings(syncData.settings);
    } catch (error) {
      console.error('应用远程数据失败:', error);
      throw error;
    }
  }, [storage]);

  // 手动同步
  const manualSync = React.useCallback(async () => {
    try {
      const prompts = await storage.getPrompts();
      const categories = await storage.getCategories();
      const settings = await storage.getSettings();
      
      await syncClient.writeSyncData(prompts, categories, settings);
    } catch (error) {
      console.error('手动同步失败:', error);
      setSyncStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '手动同步失败'
      }));
      throw error;
    }
  }, [syncClient, storage]);

  // 解决冲突
  const resolveConflict = React.useCallback(async (resolution: 'local' | 'remote' | 'merge') => {
    if (!pendingConflict) return;

    try {
      let finalData: SyncData;
      
      switch (resolution) {
        case 'local':
          finalData = pendingConflict.localData;
          await syncClient.writeSyncData(
            finalData.prompts,
            finalData.categories,
            finalData.settings
          );
          break;
          
        case 'remote':
          finalData = pendingConflict.remoteData;
          await applyRemoteData(finalData);
          break;
          
        case 'merge':
          finalData = await mergeData(pendingConflict.localData, pendingConflict.remoteData);
          await applyRemoteData(finalData);
          await syncClient.writeSyncData(
            finalData.prompts,
            finalData.categories,
            finalData.settings
          );
          break;
          
        default:
          throw new Error('无效的冲突解决方案');
      }
      
      setPendingConflict(null);
      setSyncStatus(prev => ({
        ...prev,
        hasConflicts: false,
        lastSync: new Date().toISOString(),
        error: null
      }));
      
    } catch (error) {
      console.error('解决冲突失败:', error);
      setSyncStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '解决冲突失败'
      }));
      throw error;
    }
  }, [pendingConflict, syncClient, applyRemoteData]);

  // 智能合并数据
  const mergeData = React.useCallback(async (localData: SyncData, remoteData: SyncData): Promise<SyncData> => {
    // 合并提示词（以ID为准，保留最新的）
    const mergedPrompts = new Map<string, Prompt>();
    
    [...localData.prompts, ...remoteData.prompts].forEach(prompt => {
      const existing = mergedPrompts.get(prompt.id);
      if (!existing || new Date(prompt.updatedAt) > new Date(existing.updatedAt)) {
        mergedPrompts.set(prompt.id, prompt);
      }
    });

    // 合并分类
    const mergedCategories = new Map<string, Category>();
    [...localData.categories, ...remoteData.categories].forEach(category => {
      mergedCategories.set(category.id, category);
    });

    // 设置使用最新的
    const settings = new Date(localData.lastModified) > new Date(remoteData.lastModified) 
      ? localData.settings 
      : remoteData.settings;

    const mergedData: Omit<SyncData, 'syncMetadata'> = {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      prompts: Array.from(mergedPrompts.values()),
      categories: Array.from(mergedCategories.values()),
      settings
    };

    return {
      ...mergedData,
      syncMetadata: {
        source: 'extension',
        checksum: calculateChecksum(mergedData)
      }
    };
  }, [calculateChecksum]);

  // 检查Native Host连接状态
  const checkConnection = React.useCallback(async () => {
    const isConnected = syncClient.isNativeHostConnected();
    setSyncStatus(prev => ({ ...prev, connected: isConnected }));
    return isConnected;
  }, [syncClient]);

  // 重新连接
  const reconnect = React.useCallback(async () => {
    try {
      // 重新创建连接
      syncClient.destroy();
      const newClient = SyncClient.getInstance();
      setupEventListeners();
      
      const status = await newClient.getSyncStatus();
      setSyncStatus(status);
      
      if (status.connected) {
        newClient.startAutoSync(30);
      }
    } catch (error) {
      console.error('重新连接失败:', error);
      setSyncStatus(prev => ({
        ...prev,
        connected: false,
        error: error instanceof Error ? error.message : '重新连接失败'
      }));
    }
  }, [setupEventListeners]);

  return {
    syncStatus,
    pendingConflict,
    isInitialized,
    manualSync,
    resolveConflict,
    checkConnection,
    reconnect
  };
};
