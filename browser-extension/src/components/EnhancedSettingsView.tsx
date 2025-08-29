import * as React from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  X, 
  Download, 
  Upload, 
  RefreshCw,
  Loader2,
  Settings,
  Sparkles,
  Shield,
  Keyboard,
  Palette,
  Database,
  BarChart3,
  Zap,
  Globe,
  Bell,
  Eye,
  Trash2,
  Save,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { ExtensionSettings } from '../shared/types';

interface EnhancedSettingsViewProps {
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

export const EnhancedSettingsView: React.FC<EnhancedSettingsViewProps> = ({
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
  const [activeTab, setActiveTab] = React.useState('general');
  const [lastSyncTime, setLastSyncTime] = React.useState<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // 加载同步时间
  React.useEffect(() => {
    const savedSyncTime = localStorage.getItem('promptmate_last_sync');
    setLastSyncTime(savedSyncTime);
  }, []);

  // 即时保存设置
  const updateSetting = React.useCallback(async (key: keyof ExtensionSettings, value: any) => {
    try {
      await onUpdateSettings({ [key]: value });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  }, [onUpdateSettings]);

  // 处理文件导入
  const handleFileImport = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportData(file);
      event.target.value = '';
    }
  }, [onImportData]);

  // 模拟同步功能
  const handleSync = React.useCallback(async () => {
    setIsSyncing(true);
    try {
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

  const settingsTabs = [
    { id: 'general', label: '常规', icon: Settings },
    { id: 'security', label: '安全', icon: Shield },
    { id: 'appearance', label: '外观', icon: Palette },
    { id: 'shortcuts', label: '快捷键', icon: Keyboard },
    { id: 'sync', label: '同步', icon: RefreshCw },
    { id: 'data', label: '数据', icon: Database },
    { id: 'stats', label: '统计', icon: BarChart3 },
    { id: 'advanced', label: '高级', icon: Zap },
  ];

  return (
    <div className="flex flex-col h-full bg-background animate-in slide-in-from-right-full duration-300">
      {/* 导航头部 */}
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
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs">
              未保存
            </Badge>
          )}
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

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* 标签页导航 */}
          <div className="flex-shrink-0 px-3 py-2 border-b border-border/30">
            <ScrollArea className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex flex-col items-center gap-1 h-12 text-xs"
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </ScrollArea>
          </div>

          {/* 标签页内容 */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {/* 常规设置 */}
              <TabsContent value="general" className="p-3 space-y-6 m-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    基础功能
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
                      <Label className="text-xs font-medium">显示使用统计</Label>
                      <Switch
                        checked={settings.showUsageStats || false}
                        onCheckedChange={(checked) => updateSetting('showUsageStats', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">显示通知</Label>
                      <Switch
                        checked={settings.showNotifications || false}
                        onCheckedChange={(checked) => updateSetting('showNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    默认设置
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">默认分类</Label>
                      <Select value={settings.defaultCategory} onValueChange={(value) => updateSetting('defaultCategory', value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="选择默认分类" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">通用</SelectItem>
                          <SelectItem value="work">工作</SelectItem>
                          <SelectItem value="creative">创意</SelectItem>
                          <SelectItem value="technical">技术</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">历史记录保留数量</Label>
                      <Input
                        type="number"
                        value={settings.maxHistory || 100}
                        onChange={(e) => updateSetting('maxHistory', parseInt(e.target.value))}
                        className="h-8"
                        min="10"
                        max="1000"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 安全设置 */}
              <TabsContent value="security" className="p-3 space-y-6 m-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    站点权限
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">允许的网站（白名单）</Label>
                      <Textarea
                        placeholder="每行一个域名，如：example.com"
                        value={(settings.allowList || []).join('\n')}
                        onChange={(e) => updateSetting('allowList', e.target.value.split('\n').filter(Boolean))}
                        className="h-20 text-xs"
                      />
                      <p className="text-xs text-muted-foreground">
                        留空表示允许所有网站。填写后仅允许列表中的网站使用扩展。
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">禁止的网站（黑名单）</Label>
                      <Textarea
                        placeholder="每行一个域名，如：blocked-site.com"
                        value={(settings.blockList || []).join('\n')}
                        onChange={(e) => updateSetting('blockList', e.target.value.split('\n').filter(Boolean))}
                        className="h-20 text-xs"
                      />
                      <p className="text-xs text-muted-foreground">
                        禁止这些网站使用扩展功能。
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    隐私保护
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">自动清理使用记录</Label>
                      <Switch
                        checked={settings.autoExportOnChange || false}
                        onCheckedChange={(checked) => updateSetting('autoExportOnChange', checked)}
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-sm"
                      onClick={() => {
                        localStorage.removeItem('promptmate_usage_history');
                        // 显示成功提示
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      清除使用记录
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* 外观设置 */}
              <TabsContent value="appearance" className="p-3 space-y-6 m-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    主题设置
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">主题模式</Label>
                      <div className="flex rounded-md border border-input bg-background p-1">
                        {[
                          { value: 'light', label: '浅色' },
                          { value: 'dark', label: '深色' },
                          { value: 'auto', label: '跟随系统' }
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

                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">紧凑模式</Label>
                      <Switch
                        checked={settings.compactMode || false}
                        onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">字体设置</h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">字体大小</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="range"
                          min="12"
                          max="18"
                          value={settings.fontSize || 14}
                          onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-xs w-8 text-center">{settings.fontSize || 14}px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 快捷键设置 */}
              <TabsContent value="shortcuts" className="p-3 space-y-6 m-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Keyboard className="w-4 h-4" />
                    键盘快捷键
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-xs font-medium">打开扩展</div>
                        <div className="text-xs text-muted-foreground">快速打开PromptMate面板</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Ctrl+Shift+P
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-xs font-medium">搜索提示词</div>
                        <div className="text-xs text-muted-foreground">快速搜索功能</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Ctrl+K
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-xs font-medium">新建提示词</div>
                        <div className="text-xs text-muted-foreground">创建新的提示词</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Ctrl+N
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    快捷键自定义功能即将推出
                  </p>
                </div>
              </TabsContent>

              {/* 同步设置 */}
              <TabsContent value="sync" className="p-3 space-y-6 m-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    数据同步
                  </h3>
                  
                  <div className="space-y-3">
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

                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">数据变更时自动导出</Label>
                      <Switch
                        checked={settings.autoExportOnChange || false}
                        onCheckedChange={(checked) => updateSetting('autoExportOnChange', checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 数据管理 */}
              <TabsContent value="data" className="p-3 space-y-6 m-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    数据管理
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onExportData}
                        className="h-8 text-sm"
                      >
                        <Download className="w-3 h-3 mr-2" />
                        导出数据
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
                          导入数据
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onClearData}
                      className="w-full h-8 text-sm"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      清除所有数据
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* 统计设置 */}
              <TabsContent value="stats" className="p-3 space-y-6 m-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    使用统计
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">收集使用统计</Label>
                      <Switch
                        checked={settings.showUsageStats || false}
                        onCheckedChange={(checked) => updateSetting('showUsageStats', checked)}
                      />
                    </div>

                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs text-muted-foreground">
                        统计功能帮助您了解提示词的使用情况，所有数据仅在本地存储。
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 高级设置 */}
              <TabsContent value="advanced" className="p-3 space-y-6 m-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    高级功能
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">开发者模式</Label>
                      <Switch
                        checked={false}
                        onCheckedChange={() => {}}
                        disabled
                      />
                    </div>

                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs text-muted-foreground">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        高级功能正在开发中，敬请期待。
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
