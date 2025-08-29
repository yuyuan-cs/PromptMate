import * as React from 'react';
import { useTranslation } from '../i18n';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Folder,
  Cloud,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  Settings,
  Info
} from 'lucide-react';
import { ExtensionSettings } from '../shared/types';

interface SyncSettingsProps {
  settings: ExtensionSettings;
  onUpdateSettings: (updates: Partial<ExtensionSettings>) => Promise<void>;
}

interface SyncStatus {
  type: 'native' | 'file' | 'manual';
  connected: boolean;
  lastSync: string | null;
  error: string | null;
  syncing: boolean;
}

export const SyncSettings: React.FC<SyncSettingsProps> = ({
  settings,
  onUpdateSettings
}) => {
  const { t } = useTranslation();
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>({
    type: 'native',
    connected: false,
    lastSync: null,
    error: null,
    syncing: false
  });
  
  const [syncMethod, setSyncMethod] = React.useState<'native' | 'file' | 'manual'>('native');
  const [fileSyncPath, setFileSyncPath] = React.useState('');
  const [syncInterval, setSyncInterval] = React.useState(30);
  const [autoSync, setAutoSync] = React.useState(true);

  // 加载同步状态
  React.useEffect(() => {
    const loadSyncStatus = () => {
      const savedSyncTime = localStorage.getItem('promptmate_last_sync');
      const savedSyncMethod = localStorage.getItem('promptmate_sync_method') as 'native' | 'file' | 'manual' || 'native';
      const savedFilePath = localStorage.getItem('promptmate_file_sync_path') || '';
      const savedInterval = parseInt(localStorage.getItem('promptmate_sync_interval') || '30');
      const savedAutoSync = localStorage.getItem('promptmate_auto_sync') !== 'false';

      setSyncMethod(savedSyncMethod);
      setFileSyncPath(savedFilePath);
      setSyncInterval(savedInterval);
      setAutoSync(savedAutoSync);
      
      setSyncStatus(prev => ({
        ...prev,
        type: savedSyncMethod,
        lastSync: savedSyncTime,
        connected: savedSyncMethod === 'native' ? checkNativeConnection() : savedSyncMethod === 'file' ? !!savedFilePath : true
      }));
    };

    loadSyncStatus();
  }, []);

  // 检查 Native Messaging 连接
  const checkNativeConnection = (): boolean => {
    // 模拟检查 Native Host 连接
    try {
      // 这里应该实际检查 chrome.runtime.connectNative
      return Math.random() > 0.3; // 模拟70%成功率
    } catch (error) {
      return false;
    }
  };

  // 测试连接
  const testConnection = React.useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, syncing: true, error: null }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let connected = false;
      let error = null;

      switch (syncMethod) {
        case 'native':
          connected = checkNativeConnection();
          if (!connected) {
            error = t('sync_error_native_host_connection_failed');
          }
          break;
        case 'file':
          connected = !!fileSyncPath;
          if (!connected) {
            error = t('sync_error_invalid_file_path');
          }
          break;
        case 'manual':
          connected = true;
          break;
      }

      setSyncStatus(prev => ({
        ...prev,
        connected,
        error,
        syncing: false
      }));
    } catch (err) {
      setSyncStatus(prev => ({
        ...prev,
        connected: false,
        error: t('sync_error_connection_test_failed'),
        syncing: false
      }));
    }
  }, [syncMethod, fileSyncPath]);

  // 立即同步
  const performSync = React.useCallback(async () => {
    if (!syncStatus.connected) {
      await testConnection();
      return;
    }

    setSyncStatus(prev => ({ ...prev, syncing: true, error: null }));
    
    try {
      // 模拟同步过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date().toLocaleString('zh-CN');
      localStorage.setItem('promptmate_last_sync', now);
      
      setSyncStatus(prev => ({
        ...prev,
        lastSync: now,
        syncing: false,
        error: null
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        error: t('sync_error_sync_failed_retry')
      }));
    }
  }, [syncStatus.connected, testConnection]);

  // 更新同步方法
  const updateSyncMethod = React.useCallback(async (method: 'native' | 'file' | 'manual') => {
    setSyncMethod(method);
    localStorage.setItem('promptmate_sync_method', method);
    
    setSyncStatus(prev => ({
      ...prev,
      type: method,
      connected: false,
      error: null
    }));

    // 自动测试新的连接方法
    setTimeout(() => testConnection(), 500);
  }, [testConnection]);

  // 更新文件同步路径
  const updateFileSyncPath = React.useCallback((path: string) => {
    setFileSyncPath(path);
    localStorage.setItem('promptmate_file_sync_path', path);
    
    if (syncMethod === 'file') {
      setSyncStatus(prev => ({
        ...prev,
        connected: !!path,
        error: path ? null : '请设置有效的同步文件路径'
      }));
    }
  }, [syncMethod]);

  // 更新同步间隔
  const updateSyncInterval = React.useCallback((interval: number) => {
    setSyncInterval(interval);
    localStorage.setItem('promptmate_sync_interval', interval.toString());
  }, []);

  // 更新自动同步
  const updateAutoSync = React.useCallback((enabled: boolean) => {
    setAutoSync(enabled);
    localStorage.setItem('promptmate_auto_sync', enabled.toString());
  }, []);

  // 获取状态图标和颜色
  const getStatusIcon = () => {
    if (syncStatus.syncing) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (syncStatus.error) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (syncStatus.connected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (syncStatus.syncing) return t('sync_status_connecting');
    if (syncStatus.error) return syncStatus.error;
    if (syncStatus.connected) return t('sync_status_connected');
    return t('sync_status_disconnected');
  };

  const getMethodIcon = (method: 'native' | 'file' | 'manual') => {
    switch (method) {
      case 'native': return <Monitor className="w-4 h-4" />;
      case 'file': return <Folder className="w-4 h-4" />;
      case 'manual': return <Smartphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 同步状态概览 */}
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            {getStatusIcon()}
            {t('sync_status_title')}
          </h3>
          <Badge variant={syncStatus.connected ? 'default' : 'secondary'}>
            {getStatusText()}
          </Badge>
        </div>
        
        {syncStatus.lastSync && (
          <p className="text-xs text-muted-foreground">
            {t('sync_status_last_sync')}: {syncStatus.lastSync}
          </p>
        )}
        
        {syncStatus.error && (
          <p className="text-xs text-red-500 mt-2">
            {syncStatus.error}
          </p>
        )}
      </div>

      {/* 同步方式选择 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t('sync_method_title')}</h3>
        
        <div className="grid gap-3">
          {/* Native Messaging */}
          <div 
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              syncMethod === 'native' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
            onClick={() => updateSyncMethod('native')}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span className="text-sm font-medium">{t('sync_method_native_messaging_title')}</span>
              </div>
              {syncMethod === 'native' && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('sync_method_native_messaging_description')}
            </p>
          </div>

          {/* 文件同步 */}
          <div 
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              syncMethod === 'file' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
            onClick={() => updateSyncMethod('file')}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <span className="text-sm font-medium">{t('sync_method_file_sync_title')}</span>
              </div>
              {syncMethod === 'file' && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('sync_method_file_sync_description')}
            </p>
          </div>

          {/* 手动同步 */}
          <div 
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              syncMethod === 'manual' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
            onClick={() => updateSyncMethod('manual')}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm font-medium">{t('sync_method_manual_sync_title')}</span>
              </div>
              {syncMethod === 'manual' && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('sync_method_manual_sync_description')}
            </p>
          </div>
        </div>
      </div>

      {/* 文件同步配置 */}
      {syncMethod === 'file' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t('sync_config_file_sync_title')}</h3>
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">{t('sync_config_interval_seconds')}</Label>
              <Select value={syncInterval.toString()} onValueChange={(value) => updateSyncInterval(parseInt(value))}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">{t('sync_config_interval_10s')}</SelectItem>
                  <SelectItem value="30">{t('sync_config_interval_30s')}</SelectItem>
                  <SelectItem value="60">{t('sync_config_interval_1m')}</SelectItem>
                  <SelectItem value="300">{t('sync_config_interval_5m')}</SelectItem>
                  <SelectItem value="600">{t('sync_config_interval_10m')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* 同步选项 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t('sync_options_title')}</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">{t('sync_options_auto_sync')}</Label>
            <Switch
              checked={autoSync}
              onCheckedChange={updateAutoSync}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">{t('sync_options_auto_export_on_change')}</Label>
            <Switch
              checked={settings.autoExportOnChange || false}
              onCheckedChange={(checked) => onUpdateSettings({ autoExportOnChange: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* 同步操作 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t('sync_actions_title')}</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={syncStatus.syncing}
            className="h-8 text-sm"
          >
            {syncStatus.syncing ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                {t('sync_actions_testing_connection_in_progress')}
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 mr-2" />
                {t('sync_actions_test_connection')}
              </>
            )}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={performSync}
            disabled={syncStatus.syncing || !syncStatus.connected}
            className="h-8 text-sm"
          >
            {syncStatus.syncing ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                {t('sync_actions_syncing_in_progress')}
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-2" />
                {t('sync_actions_sync_now')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 帮助信息 */}
      <div className="p-3 bg-muted/30 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>{t('sync_help_native_messaging_title')}</strong> {t('sync_help_native_messaging_description')}</p>
            <p><strong>{t('sync_help_file_sync_title')}</strong> {t('sync_help_file_sync_description')}</p>
            <p><strong>{t('sync_help_manual_sync_title')}</strong> {t('sync_help_manual_sync_description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
