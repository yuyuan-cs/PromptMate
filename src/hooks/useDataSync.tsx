import { useState, useEffect, useCallback } from 'react';
import { SyncManager, SyncData } from '../lib/syncManager';
import { usePrompts } from './usePrompts';
import { useToast } from './use-toast';
import { Prompt, Category, Settings } from '../types';

export interface SyncStatus {
  enabled: boolean;
  connected: boolean;
  lastSync: string | null;
  hasConflicts: boolean;
  syncing: boolean;
  error: string | null;
}

export interface SyncConflict {
  localData: SyncData;
  remoteData: SyncData;
  timestamp: string;
}

export const useDataSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    enabled: false,
    connected: false,
    lastSync: null,
    hasConflicts: false,
    syncing: false,
    error: null
  });
  
  const [pendingConflict, setPendingConflict] = useState<SyncConflict | null>(null);
  const { prompts, categories, settings, refreshData } = usePrompts();
  const { toast } = useToast();
  const syncManager = SyncManager.getInstance();

  // 初始化同步管理器
  useEffect(() => {
    const initializeSync = async () => {
      try {
        await syncManager.initialize();
        
        // 更新同步状态
        const status = syncManager.getSyncStatus();
        setSyncStatus(prev => ({
          ...prev,
          enabled: status.enabled,
          connected: true,
          lastSync: status.lastSync,
          hasConflicts: status.hasConflicts
        }));

        // 设置事件监听器
        setupEventListeners();
        
      } catch (error) {
        console.error('同步初始化失败:', error);
        setSyncStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '同步初始化失败'
        }));
      }
    };

    initializeSync();

    return () => {
      syncManager.removeAllListeners();
    };
  }, []);

  // 设置事件监听器
  const setupEventListeners = useCallback(() => {
    // 数据变更事件
    syncManager.on('dataChanged', async (syncData: SyncData) => {
      try {
        setSyncStatus(prev => ({ ...prev, syncing: true }));
        
        // 检测冲突
        const currentData = await createCurrentSyncData();
        const hasConflict = await syncManager.detectConflict(currentData, syncData);
        
        if (hasConflict) {
          // 显示冲突解决界面
          setPendingConflict({
            localData: currentData,
            remoteData: syncData,
            timestamp: new Date().toISOString()
          });
          
          setSyncStatus(prev => ({ ...prev, hasConflicts: true, syncing: false }));
          
          toast({
            title: "数据同步冲突",
            description: "检测到数据冲突，请选择解决方案",
            variant: "destructive"
          });
        } else {
          // 自动应用远程数据
          await applyRemoteData(syncData);
          
          setSyncStatus(prev => ({ 
            ...prev, 
            lastSync: new Date().toISOString(),
            syncing: false,
            error: null
          }));
          
          toast({
            title: "数据同步成功",
            description: "已从桌面端同步最新数据"
          });
        }
      } catch (error) {
        console.error('处理数据变更失败:', error);
        setSyncStatus(prev => ({
          ...prev,
          syncing: false,
          error: error instanceof Error ? error.message : '数据同步失败'
        }));
      }
    });

    // 同步完成事件
    syncManager.on('dataSynced', () => {
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        syncing: false,
        error: null
      }));
    });

    // 冲突检测事件
    syncManager.on('conflictDetected', ({ localData, remoteData }: { localData: SyncData, remoteData: SyncData }) => {
      setPendingConflict({
        localData,
        remoteData,
        timestamp: new Date().toISOString()
      });
      
      setSyncStatus(prev => ({ ...prev, hasConflicts: true }));
    });

    // 错误事件
    syncManager.on('error', (error: Error) => {
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        error: error.message
      }));
      
      toast({
        title: "同步错误",
        description: error.message,
        variant: "destructive"
      });
    });

    // 设置变更事件
    syncManager.on('settingsChanged', (settings: any) => {
      setSyncStatus(prev => ({
        ...prev,
        enabled: settings.enabled
      }));
    });
  }, [toast]);

  // 创建当前数据的同步格式
  const createCurrentSyncData = useCallback(async (): Promise<SyncData> => {
    return {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      prompts: prompts || [],
      categories: categories || [],
      settings: settings || {} as Settings,
      syncMetadata: {
        source: 'desktop',
        checksum: ''
      }
    };
  }, [prompts, categories, settings]);

  // 应用远程数据
  const applyRemoteData = useCallback(async (syncData: SyncData) => {
    // 这里需要调用数据更新方法
    // 由于 usePrompts hook 可能没有直接的更新方法，
    // 我们需要通过其他方式来更新数据
    await refreshData();
  }, [refreshData]);

  // 手动同步
  const manualSync = useCallback(async () => {
    try {
      setSyncStatus(prev => ({ ...prev, syncing: true, error: null }));
      
      if (prompts && categories && settings) {
        await syncManager.manualSync(prompts, categories, settings);
      }
      
      toast({
        title: "手动同步成功",
        description: "数据已同步到浏览器扩展"
      });
    } catch (error) {
      console.error('手动同步失败:', error);
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        error: error instanceof Error ? error.message : '手动同步失败'
      }));
      
      toast({
        title: "手动同步失败",
        description: error instanceof Error ? error.message : '手动同步失败',
        variant: "destructive"
      });
    }
  }, [prompts, categories, settings, syncManager, toast]);

  // 解决冲突
  const resolveConflict = useCallback(async (resolution: 'local' | 'remote' | 'merge') => {
    if (!pendingConflict) return;

    try {
      setSyncStatus(prev => ({ ...prev, syncing: true }));
      
      const resolvedData = await syncManager.resolveConflict(
        pendingConflict.localData,
        pendingConflict.remoteData
      );
      
      if (resolution === 'remote') {
        await applyRemoteData(pendingConflict.remoteData);
      } else if (resolution === 'merge') {
        await applyRemoteData(resolvedData);
      }
      // 'local' 情况下不需要做任何事，保持本地数据
      
      setPendingConflict(null);
      setSyncStatus(prev => ({
        ...prev,
        hasConflicts: false,
        syncing: false,
        lastSync: new Date().toISOString()
      }));
      
      toast({
        title: "冲突解决成功",
        description: `已采用${resolution === 'local' ? '本地' : resolution === 'remote' ? '远程' : '合并'}数据`
      });
      
    } catch (error) {
      console.error('解决冲突失败:', error);
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        error: error instanceof Error ? error.message : '解决冲突失败'
      }));
    }
  }, [pendingConflict, syncManager, applyRemoteData, toast]);

  // 启用/禁用同步
  const toggleSync = useCallback((enabled: boolean) => {
    syncManager.updateSyncSettings({ enabled });
    setSyncStatus(prev => ({ ...prev, enabled }));
  }, [syncManager]);

  // 更新同步设置
  const updateSyncSettings = useCallback((settings: any) => {
    syncManager.updateSyncSettings(settings);
  }, [syncManager]);

  // 自动同步数据变更
  useEffect(() => {
    if (syncStatus.enabled && !syncStatus.syncing && prompts && categories && settings) {
      const syncData = async () => {
        try {
          await syncManager.writeSyncData(prompts, categories, settings);
        } catch (error) {
          console.error('自动同步失败:', error);
        }
      };
      
      // 防抖处理，避免频繁同步
      const timeoutId = setTimeout(syncData, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [prompts, categories, settings, syncStatus.enabled, syncStatus.syncing, syncManager]);

  return {
    syncStatus,
    pendingConflict,
    manualSync,
    resolveConflict,
    toggleSync,
    updateSyncSettings
  };
};
