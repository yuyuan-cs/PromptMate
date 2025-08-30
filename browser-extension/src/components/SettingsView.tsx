import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Icons } from './ui/icons';
import { ExtensionSettings } from '../shared/types';
import { useTranslation } from '../i18n';
import { useTheme } from '../hooks/useTheme';
import { DataManager } from '../utils/dataManager';
import { SitePermissionManager } from '../utils/sitePermissions';
import { AISettings } from './AISettings';
import { LanguageSelector } from './ui/LanguageSelector';
import { SyncSettings } from './SyncSettings';
import EnhancedSettingsView from './settings/EnhancedSettingsView';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [currentView, setCurrentView] = useState('main');
  const [settings, setSettings] = useState<ExtensionSettings>({
    theme: 'auto',
    fontSize: 14,
    autoInject: false,
    showNotifications: true,
    defaultCategory: '',
    autoSave: true,
    maxHistory: 100,
    enableShortcuts: true,
    showUsageStats: true,
    compactMode: false,
    allowList: [],
    blockList: [],
    autoExportOnChange: false,
  });

  // 数据统计状态
  const [dataStats, setDataStats] = useState({
    promptCount: 0,
    categoryCount: 0,
    totalUsage: 0,
  });

  // 操作状态
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // 站点权限相关状态
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [allowedSites, setAllowedSites] = useState<string[]>([]);
  const [newDomainInput, setNewDomainInput] = useState('');

  // 加载设置
  useEffect(() => {
    loadSettings();
    loadDataStats();
    loadCurrentDomain();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.local.get(['settings']);
      if (result.settings) {
        setSettings({ ...settings, ...result.settings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadDataStats = async () => {
    try {
      const stats = await DataManager.getDataStats();
      console.log('Data stats loaded:', stats); // 调试日志
      setDataStats(stats);
    } catch (error) {
      console.error('Failed to load data stats:', error);
      // 设置默认值以确保界面显示
      setDataStats({
        promptCount: 0,
        categoryCount: 0,
        totalUsage: 0
      });
    }
  };

  const loadCurrentDomain = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url) {
        const url = new URL(tab.url);
        setCurrentDomain(url.hostname);
        
        const permissions = await SitePermissionManager.getAllPermissions();
        setAllowedSites(permissions.allowList || []);
      }
    } catch (error) {
      console.error('Failed to load current domain:', error);
    }
  };

  const saveSettings = async (newSettings: Partial<ExtensionSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      await chrome.storage.local.set({ settings: updatedSettings });
      
      // 如果是主题设置，同时更新主题
      if (newSettings.theme) {
        setTheme(newSettings.theme as 'light' | 'dark' | 'system');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // 数据管理操作
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await DataManager.exportData();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    setIsImporting(true);
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          await DataManager.importData(file);
        }
      };
      input.click();
      await loadDataStats(); // 重新加载统计数据
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAllData = async () => {
    if (!confirm(t('settings.confirmClearData'))) {
      return;
    }
    
    setIsClearing(true);
    try {
      await DataManager.clearAllData();
      await loadDataStats(); // 重新加载统计数据
    } catch (error) {
      console.error('Clear data failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // 站点权限操作
  const toggleCurrentSitePermission = async () => {
    if (!currentDomain) return;
    
    try {
      const isAllowed = allowedSites.includes(currentDomain);
      if (isAllowed) {
        await SitePermissionManager.removeFromAllowList(currentDomain);
        setAllowedSites(prev => prev.filter(site => site !== currentDomain));
      } else {
        await SitePermissionManager.addToAllowList(currentDomain);
        setAllowedSites(prev => [...prev, currentDomain]);
      }
    } catch (error) {
      console.error('Failed to toggle site permission:', error);
    }
  };

  const removeSiteFromList = async (site: string) => {
    try {
      await SitePermissionManager.removeFromAllowList(site);
      setAllowedSites(prev => prev.filter(s => s !== site));
    } catch (error) {
      console.error('Failed to remove site:', error);
    }
  };

  const addSiteToAllowList = async (domain: string) => {
    try {
      await SitePermissionManager.addToAllowList(domain);
      setAllowedSites(prev => [...prev, domain]);
    } catch (error) {
      console.error('Failed to add site:', error);
    }
  };

  const currentSiteAllowed = allowedSites.includes(currentDomain);

  if (currentView === 'enhanced') {
    return <EnhancedSettingsView onBack={() => setCurrentView('main')} />;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-7 w-7 p-0"
          >
            <Icons.chevronDown className="h-4 w-4 rotate-90" />
          </Button>
          <h2 className="text-sm font-medium text-foreground truncate">
            {t('settings.title')}
          </h2>
        </div>
      </div>

      {/* 设置内容 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-3 pt-3 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="text-xs truncate">{t('settings.general')}</TabsTrigger>
              <TabsTrigger value="ai" className="text-xs truncate">{t('settings.aiConfiguration')}</TabsTrigger>
              <TabsTrigger value="appearance" className="text-xs truncate">{t('settings.appearance')}</TabsTrigger>
              <TabsTrigger value="data" className="text-xs truncate">{t('settings.dataManagement')}</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-3">
              {/* 常规设置选项卡 */}
              <TabsContent value="general" className="space-y-4 mt-0">
                {/* 语言设置 */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t('settings.language')}</CardTitle>
                    <CardDescription className="text-xs">
                      {t('settings.languageDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">
                        {t('settings.interfaceLanguage')}
                      </Label>
                      <LanguageSelector />
                    </div>
                  </CardContent>
                </Card>

                {/* 站点权限设置 */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t('settings.sitePermissions')}</CardTitle>
                    <CardDescription className="text-xs">
                      {t('settings.sitePermissionsDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {currentDomain && (
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">
                          {currentDomain}
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={toggleCurrentSitePermission}
                        >
                          {currentSiteAllowed ? t('settings.block') : t('settings.allow')}
                        </Button>
                      </div>
                    )}
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">{t('settings.allowedSites')}</Label>
                      <div className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
                        {allowedSites.map((site, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted/30 rounded px-2 py-1">
                            <span className="text-xs font-mono">{site}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeSiteFromList(site)}
                            >
                              <Icons.x className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={t('settings.addDomain')}
                          value={newDomainInput}
                          onChange={(e) => setNewDomainInput(e.target.value)}
                          className="flex-1 h-7 text-xs"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (newDomainInput.trim()) {
                              addSiteToAllowList(newDomainInput.trim());
                              setNewDomainInput('');
                            }
                          }}
                          className="h-7 text-xs"
                        >
                          {t('settings.add')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 增强功能设置 */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t('settings.enhanced.title')}</CardTitle>
                    <CardDescription className="text-xs">{t('settings.enhanced.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={() => setCurrentView('enhanced')}
                    >
                      {t('settings.common.title')}
                      <Icons.chevronDown className="h-3 w-3 ml-1 -rotate-90" />
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI配置选项卡 */}
              <TabsContent value="ai" className="space-y-4 mt-0">
                <AISettings />
              </TabsContent>

              {/* 外观设置选项卡 */}
              <TabsContent value="appearance" className="space-y-4 mt-0">
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t('settings.appearance')}</CardTitle>
                    <CardDescription className="text-xs">
                      {t('settings.appearanceDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="theme" className="text-xs font-medium">
                        {t('settings.theme')}
                      </Label>
                      <Select
                        value={settings.theme}
                        onValueChange={(value) => saveSettings({ theme: value as 'light' | 'dark' | 'auto' })}
                      >
                        <SelectTrigger className="w-24 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                          <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                          <SelectItem value="auto">{t('settings.themeAuto')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fontSize" className="text-xs font-medium">
                        {t('settings.fontSize')}
                      </Label>
                      <Select
                        value={settings.fontSize.toString()}
                        onValueChange={(value) => saveSettings({ fontSize: parseInt(value) })}
                      >
                        <SelectTrigger className="w-16 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12</SelectItem>
                          <SelectItem value="14">14</SelectItem>
                          <SelectItem value="16">16</SelectItem>
                          <SelectItem value="18">18</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compactMode" className="text-xs font-medium">
                        {t('settings.compactMode')}
                      </Label>
                      <Switch
                        id="compactMode"
                        checked={settings.compactMode}
                        onCheckedChange={(checked) => saveSettings({ compactMode: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 功能设置 */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t('settings.functionality')}</CardTitle>
                    <CardDescription className="text-xs">
                      {t('settings.functionalityDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoInject" className="text-xs font-medium">
                        {t('settings.autoInject')}
                      </Label>
                      <Switch
                        id="autoInject"
                        checked={settings.autoInject}
                        onCheckedChange={(checked) => saveSettings({ autoInject: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showNotifications" className="text-xs font-medium">
                        {t('settings.showNotifications')}
                      </Label>
                      <Switch
                        id="showNotifications"
                        checked={settings.showNotifications}
                        onCheckedChange={(checked) => saveSettings({ showNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableShortcuts" className="text-xs font-medium">
                        {t('settings.enableShortcuts')}
                      </Label>
                      <Switch
                        id="enableShortcuts"
                        checked={settings.enableShortcuts}
                        onCheckedChange={(checked) => saveSettings({ enableShortcuts: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 数据管理选项卡 */}
              <TabsContent value="data" className="space-y-4 mt-0">
                {/* 数据统计 */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t('settings.dataManagement')}</CardTitle>
                    <CardDescription className="text-xs">
                      {t('settings.dataManagementDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                      <div>{t('settings.prompts')}: <span className="font-medium">{dataStats.promptCount}</span></div>
                      <div>{t('settings.categories')}: <span className="font-medium">{dataStats.categoryCount}</span></div>
                      <div>{t('settings.totalUsage')}: <span className="font-medium">{dataStats.totalUsage}</span></div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {t('settings.lastUpdated')}: {new Date().toLocaleString()}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportData}
                        disabled={isExporting}
                        className="flex-1 h-7 text-xs"
                      >
                        <Icons.copy className="h-3 w-3 mr-1" />
                        {isExporting ? t('settings.exporting') : t('settings.exportData')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleImportData}
                        disabled={isImporting}
                        className="flex-1 h-7 text-xs"
                      >
                        <Icons.upload className="h-3 w-3 mr-1" />
                        {isImporting ? t('settings.importing') : t('settings.importData')}
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleClearAllData}
                      disabled={isClearing}
                      className="w-full h-7 text-xs"
                    >
                      <Icons.trash className="h-3 w-3 mr-1" />
                      {isClearing ? t('settings.clearing') : t('settings.clearAllData')}
                    </Button>
                  </CardContent>
                </Card>

                {/* 数据同步 */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t('settings.sync.title')}</CardTitle>
                    <CardDescription className="text-xs">
                      {t('settings.sync.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <SyncSettings 
                      settings={settings} 
                      onUpdateSettings={saveSettings}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
