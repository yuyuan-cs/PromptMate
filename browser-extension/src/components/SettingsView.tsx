import * as React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  ArrowLeft, 
  X, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { ExtensionSettings } from '../shared/types';

interface SettingsViewProps {
  isVisible: boolean;
  settings: ExtensionSettings;
  onBack: () => void;
  onClose: () => void;
  onUpdateSettings: (updates: Partial<ExtensionSettings>) => Promise<void>;
  onExportData: () => void;
  onImportData: (file: File) => Promise<void>;
  onClearData: () => void;
}

interface AISettings {
  provider: 'openai' | 'anthropic' | 'gemini' | 'custom';
  apiKey: string;
  endpoint?: string;
  model?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isVisible,
  settings,
  onBack,
  onClose,
  onUpdateSettings,
  onExportData,
  onImportData,
  onClearData
}) => {
  const [aiSettings, setAiSettings] = React.useState<AISettings>({
    provider: 'openai',
    apiKey: '',
    endpoint: '',
    model: 'gpt-3.5-turbo'
  });
  
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = React.useState('');
  const [lastSyncTime, setLastSyncTime] = React.useState<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // 加载AI设置
  React.useEffect(() => {
    if (isVisible) {
      const savedAiSettings = localStorage.getItem('promptmate_ai_settings');
      if (savedAiSettings) {
        try {
          setAiSettings(JSON.parse(savedAiSettings));
        } catch (error) {
          console.error('Failed to load AI settings:', error);
        }
      }
      
      const savedSyncTime = localStorage.getItem('promptmate_last_sync');
      setLastSyncTime(savedSyncTime);
    }
  }, [isVisible]);

  // 保存AI设置
  const saveAiSettings = React.useCallback((newSettings: Partial<AISettings>) => {
    const updated = { ...aiSettings, ...newSettings };
    setAiSettings(updated);
    localStorage.setItem('promptmate_ai_settings', JSON.stringify(updated));
  }, [aiSettings]);

  // 即时保存设置
  const updateSetting = React.useCallback(async (key: keyof ExtensionSettings, value: any) => {
    try {
      await onUpdateSettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  }, [onUpdateSettings]);

  // 测试API连接
  const testConnection = React.useCallback(async () => {
    if (!aiSettings.apiKey.trim()) {
      setConnectionStatus('error');
      setConnectionError('请输入API密钥');
      return;
    }

    setConnectionStatus('testing');
    setConnectionError('');

    try {
      let url = '';
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      let body: any = {};

      switch (aiSettings.provider) {
        case 'openai':
          url = aiSettings.endpoint || 'https://api.openai.com/v1/chat/completions';
          headers['Authorization'] = `Bearer ${aiSettings.apiKey}`;
          body = {
            model: aiSettings.model || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 5
          };
          break;
        case 'anthropic':
          url = aiSettings.endpoint || 'https://api.anthropic.com/v1/messages';
          headers['x-api-key'] = aiSettings.apiKey;
          headers['anthropic-version'] = '2023-06-01';
          body = {
            model: aiSettings.model || 'claude-3-haiku-20240307',
            max_tokens: 5,
            messages: [{ role: 'user', content: 'test' }]
          };
          break;
        case 'gemini':
          url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${aiSettings.apiKey}`;
          body = {
            contents: [{ parts: [{ text: 'test' }] }]
          };
          break;
        case 'custom':
          if (!aiSettings.endpoint) {
            throw new Error('请输入自定义API端点');
          }
          url = aiSettings.endpoint;
          headers['Authorization'] = `Bearer ${aiSettings.apiKey}`;
          body = {
            model: aiSettings.model || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 5
          };
          break;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setConnectionStatus('success');
        setTimeout(() => setConnectionStatus('idle'), 3000);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : '连接失败');
      setTimeout(() => setConnectionStatus('idle'), 5000);
    }
  }, [aiSettings]);

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

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full bg-background animate-in slide-in-from-right-full duration-300">
      {/* 紧凑导航头部 */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-border/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-7 w-7 p-0 hover:bg-muted/60"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-medium text-sm truncate flex-1">
            扩展设置
          </h2>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0 hover:bg-muted/60"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
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

            {/* AI 设置 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground border-b border-border/30 pb-1">
                AI 设置
              </h3>
              
              <div className="space-y-3">
                {/* 服务商选择 */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">服务商</Label>
                  <Select
                    value={aiSettings.provider}
                    onValueChange={(value: AISettings['provider']) => saveAiSettings({ provider: value })}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                      <SelectItem value="custom">自定义</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* API 密钥 */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">API 密钥</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={aiSettings.apiKey}
                        onChange={(e) => saveAiSettings({ apiKey: e.target.value })}
                        placeholder="输入API密钥..."
                        className="h-8 text-sm pr-8"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 自定义端点 */}
                {(aiSettings.provider === 'custom' || aiSettings.provider === 'openai') && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      API 端点 <span className="text-muted-foreground/60">(可选)</span>
                    </Label>
                    <Input
                      value={aiSettings.endpoint || ''}
                      onChange={(e) => saveAiSettings({ endpoint: e.target.value })}
                      placeholder="https://api.openai.com/v1/chat/completions"
                      className="h-8 text-sm"
                    />
                  </div>
                )}

                {/* 连接测试 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testConnection}
                  disabled={connectionStatus === 'testing' || !aiSettings.apiKey.trim()}
                  className="w-full h-8 text-sm"
                >
                  {connectionStatus === 'testing' && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                  {connectionStatus === 'success' && <CheckCircle className="w-3 h-3 mr-2 text-green-500" />}
                  {connectionStatus === 'error' && <XCircle className="w-3 h-3 mr-2 text-red-500" />}
                  {connectionStatus === 'testing' ? '测试中...' : 
                   connectionStatus === 'success' ? '连接成功' :
                   connectionStatus === 'error' ? '连接失败' : '测试连接'}
                </Button>
                
                {connectionError && (
                  <p className="text-xs text-destructive">{connectionError}</p>
                )}
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
        </ScrollArea>
      </div>
    </div>
  );
};
