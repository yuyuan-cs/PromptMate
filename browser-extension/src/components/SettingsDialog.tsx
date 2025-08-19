import * as React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';
import { Settings } from '../shared/types';
import { Download, Upload, Trash2, FileText, Database, Palette, Zap, Shield, Info, Save, AlertTriangle } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings | null;
  onUpdateSettings: (updates: Partial<Settings>) => Promise<void>;
  onExportData: () => Promise<string>;
  onImportData: (jsonData: string) => Promise<void>;
  onClearData: () => Promise<void>;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onClearData
}) => {
  const { theme, setTheme } = useTheme();
  const [isExporting, setIsExporting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = React.useState(false);
  const [localSettings, setLocalSettings] = React.useState<Partial<Settings>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 初始化本地设置
  React.useEffect(() => {
    if (settings) {
      setLocalSettings({
        autoSave: settings.autoSave ?? true,
        defaultCategory: settings.defaultCategory || 'general',
        maxHistory: settings.maxHistory || 50,
        enableShortcuts: settings.enableShortcuts ?? true,
        showUsageStats: settings.showUsageStats ?? true,
        compactMode: settings.compactMode ?? false,
      });
    }
  }, [settings]);

  // 更新本地设置
  const updateLocalSetting = (key: keyof Settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  // 保存设置
  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await onUpdateSettings(localSettings);
      showToast('设置已保存', 'success');
    } catch (error) {
      console.error('保存设置失败:', error);
      showToast('保存设置失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 导出数据
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await onExportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptmate-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('数据导出成功', 'success');
    } catch (error) {
      console.error('导出失败:', error);
      showToast('导出失败', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // 导入数据
  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const text = await file.text();
      await onImportData(text);
      showToast('数据导入成功', 'success');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('导入失败:', error);
      setImportError('导入失败：文件格式不正确或数据损坏');
    } finally {
      setIsImporting(false);
    }
  };

  // 清空数据
  const handleClearData = async () => {
    if (!showConfirmClear) {
      setShowConfirmClear(true);
      return;
    }

    setIsClearing(true);
    try {
      await onClearData();
      setShowConfirmClear(false);
      showToast('数据已清空', 'success');
    } catch (error) {
      console.error('清空失败:', error);
      showToast('清空失败', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  // 显示提示消息
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // 简单的提示实现
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              扩展设置
            </DialogTitle>
            <DialogDescription>
              自定义PromptMate的行为和外观，管理您的数据
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* 外观设置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">外观设置</h3>
                </div>
                
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>主题模式</Label>
                      <p className="text-xs text-muted-foreground">选择您喜欢的主题</p>
                    </div>
                    <ThemeToggle currentTheme={theme} onThemeChange={setTheme} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>紧凑模式</Label>
                      <p className="text-xs text-muted-foreground">减少界面间距，显示更多内容</p>
                    </div>
                    <Switch
                      checked={localSettings.compactMode}
                      onCheckedChange={(checked) => updateLocalSetting('compactMode', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* 功能设置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">功能设置</h3>
                </div>
                
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>自动保存</Label>
                      <p className="text-xs text-muted-foreground">编辑时自动保存提示词</p>
                    </div>
                    <Switch
                      checked={localSettings.autoSave}
                      onCheckedChange={(checked) => updateLocalSetting('autoSave', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>启用快捷键</Label>
                      <p className="text-xs text-muted-foreground">使用键盘快捷键操作</p>
                    </div>
                    <Switch
                      checked={localSettings.enableShortcuts}
                      onCheckedChange={(checked) => updateLocalSetting('enableShortcuts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>显示使用统计</Label>
                      <p className="text-xs text-muted-foreground">显示提示词使用次数</p>
                    </div>
                    <Switch
                      checked={localSettings.showUsageStats}
                      onCheckedChange={(checked) => updateLocalSetting('showUsageStats', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>默认分类</Label>
                    <Select
                      value={localSettings.defaultCategory || 'general'}
                      onValueChange={(value) => updateLocalSetting('defaultCategory', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择默认分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">通用</SelectItem>
                        <SelectItem value="work">工作</SelectItem>
                        <SelectItem value="creative">创意</SelectItem>
                        <SelectItem value="code">编程</SelectItem>
                        <SelectItem value="study">学习</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>历史记录条数</Label>
                    <Input
                      type="number"
                      min="10"
                      max="200"
                      value={localSettings.maxHistory || 50}
                      onChange={(e) => updateLocalSetting('maxHistory', parseInt(e.target.value) || 50)}
                    />
                  </div>
                </div>
              </div>

              {/* 数据管理 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">数据管理</h3>
                </div>
                
                <div className="space-y-3 pl-6">
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="w-full justify-start"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isExporting ? '导出中...' : '导出数据'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleImportData}
                      disabled={isImporting}
                      className="w-full justify-start"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isImporting ? '导入中...' : '导入数据'}
                    </Button>

                    <Button
                      variant={showConfirmClear ? "destructive" : "outline"}
                      onClick={handleClearData}
                      disabled={isClearing}
                      className="w-full justify-start"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isClearing 
                        ? '清空中...' 
                        : showConfirmClear 
                        ? '确认清空所有数据' 
                        : '清空所有数据'
                      }
                    </Button>

                    {showConfirmClear && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <p className="text-sm text-destructive">
                          此操作将删除所有提示词、分类和设置，且无法恢复！
                        </p>
                      </div>
                    )}
                  </div>

                  {importError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{importError}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 关于信息 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">关于</h3>
                </div>
                
                <div className="pl-6 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">版本</span>
                    <Badge variant="secondary">1.0.0</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">构建日期</span>
                    <span className="text-xs">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? '保存中...' : '保存设置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
};