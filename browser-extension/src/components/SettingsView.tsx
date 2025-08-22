import * as React from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import { 
  ArrowLeft, 
  X, 
  Download, 
  Upload, 
  RefreshCw,
  Loader2,
  Settings,
  Sparkles
} from 'lucide-react';
import { ExtensionSettings } from '../shared/types';
import { AISettings } from './AISettings';

interface SettingsViewProps {
  settings: ExtensionSettings;
  onBack: () => void;
  onClose: () => void;
  onUpdateSettings: (updates: Partial<ExtensionSettings>) => Promise<void>;
  onExportData: () => void;
  onImportData: (file: File) => Promise<void>;
  onClearData: () => void;
  showBackButton?: boolean;
  showCloseButton?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onBack,
  onClose,
  onUpdateSettings,
  onExportData,
  onImportData,
  onClearData,
  showBackButton = true,
  showCloseButton = true
}) => {
  const [currentPanel, setCurrentPanel] = React.useState<'general' | 'ai'>('general');
  const [lastSyncTime, setLastSyncTime] = React.useState<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // 加载同步时间
  React.useEffect(() => {
    const savedSyncTime = localStorage.getItem('promptmate_last_sync');
    setLastSyncTime(savedSyncTime);
  }, []);

  // 即时保存设置
  const updateSetting = React.useCallback(async (key: keyof ExtensionSettings, value: any) => {
    try {
      await onUpdateSettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  }, [onUpdateSettings]);

  // 处理文件导入
  const handleFileImport = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportData(file);
      event.target.value = ''; // 重置文件输入
    }
  }, [onImportData]);

  // 模拟同步功能
  const handleSync = React.useCallback(async () => {
    setIsSyncing(true);
    try {
      // 模拟同步延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      const now = new Date().toLocaleString('zh-CN');
      setLastSyncTime(now);
      localStorage.setItem('promptmate_last_sync', now);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-background animate-in slide-in-from-right-full duration-300">
      {/* 紧凑导航头部 */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-border/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-7 w-7 p-0 hover:bg-muted/60"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <h2 className="font-medium text-sm truncate flex-1">
            扩展设置
          </h2>
        </div>
        
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 hover:bg-muted/60"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 设置面板导航 */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-border/30">
        <div className="flex rounded-md border border-input bg-background p-1">
          <Button
            variant={currentPanel === 'general' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={() => setCurrentPanel('general')}
          >
            <Settings className="w-3 h-3 mr-1" />
            常规设置
          </Button>
          <Button
            variant={currentPanel === 'ai' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={() => setCurrentPanel('ai')}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            AI设置
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {currentPanel === 'general' ? (
            <div className="p-3 space-y-6">
              {/* 外观设置 */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground border-b border-border/30 pb-1">
                  外观设置
                </h3>
                
                {/* 主题模式 - 分段控件 */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">主题</Label>
                  <div className="flex rounded-md border border-input bg-background p-1">
                    {[
                      { value: 'light', label: '浅色' },
                      { value: 'dark', label: '深色' },
                      { value: 'system', label: '系统' }
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={settings.theme === option.value ? 'default' : 'ghost'}
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={() => updateSetting('theme', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 紧凑模式 */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">紧凑模式</Label>
                  <Switch
                    checked={settings.compactMode || false}
                    onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                  />
                </div>
              </div>

              {/* 功能设置 */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground border-b border-border/30 pb-1">
                  功能设置
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">编辑时自动保存</Label>
                    <Switch
                      checked={settings.autoSave || false}
                      onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">启用键盘快捷键</Label>
                    <Switch
                      checked={settings.enableShortcuts || false}
                      onCheckedChange={(checked) => updateSetting('enableShortcuts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">显示提示词使用统计</Label>
                    <Switch
                      checked={settings.showUsageStats || false}
                      onCheckedChange={(checked) => updateSetting('showUsageStats', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* 数据管理 */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground border-b border-border/30 pb-1">
                  数据管理
                </h3>
                
                <div className="space-y-3">
                  {/* 数据导出/导入 */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onExportData}
                      className="h-8 text-sm"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      导出到文件
                    </Button>
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-sm"
                      >
                        <Upload className="w-3 h-3 mr-2" />
                        从文件导入
                      </Button>
                    </div>
                  </div>

                  {/* 桌面端同步 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">桌面端同步</span>
                      <span className="text-xs text-muted-foreground">
                        {lastSyncTime ? `上次同步: ${lastSyncTime}` : '未同步'}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="w-full h-8 text-sm"
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          同步中...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-2" />
                          立即同步
                        </>
                      )}
                    </Button>
                  </div>

                  {/* 清除数据 */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onClearData}
                    className="w-full h-8 text-sm"
                  >
                    清除所有数据
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3">
              <AISettings />
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
