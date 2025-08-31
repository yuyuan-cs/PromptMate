/**
 * 数据导入导出组件
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { exportAllData, importAllData, exportPromptsToFile, resetToDefaults } from "@/lib/data";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useDataSync } from "@/hooks/useDataSync";
import { SyncConflictDialog } from "@/components/SyncConflictDialog";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";

interface DataImportExportProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDataChanged?: () => void;
  inline?: boolean;
}

export function DataImportExport({ 
  open, 
  onOpenChange, 
  onDataChanged,
  inline = false
}: DataImportExportProps) {
  const { toast } = useToast();
  const [exportedData, setExportedData] = useState("");
  const [importData, setImportData] = useState("");
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [activeTab, setActiveTab] = useState<"export" | "import" | "sync">("export");
  const { t } = useTranslation();
  
  // 同步相关状态
  const { syncStatus, pendingConflict, manualSync, resolveConflict, toggleSync } = useDataSync();
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  // 组件挂载时强制渲染
  useEffect(() => {
    // 确保组件首次渲染时内容可见
    const forceRender = () => {};
    forceRender();
    
    console.log(t('dataManagement.message.loading'), { inline, activeTab, open });
  }, []);
  
  // 主动监听标签页变化
  useEffect(() => {
    console.log(t('dataManagement.message.log2'), activeTab);
  }, [activeTab]);
  
  // 处理冲突对话框显示
  useEffect(() => {
    if (pendingConflict && !showConflictDialog) {
      setShowConflictDialog(true);
    }
  }, [pendingConflict, showConflictDialog]);

  // 处理冲突解决
  const handleConflictResolve = async (resolution: 'local' | 'remote' | 'merge') => {
    await resolveConflict(resolution);
    setShowConflictDialog(false);
    onDataChanged?.(); // 通知数据已更改
  };

  // 手动同步处理
  const handleManualSync = async () => {
    await manualSync();
    onDataChanged?.(); // 通知数据已更改
  };

  // 生成导出数据
  const handleExport = () => {
    const data = exportAllData();
    setExportedData(data);
    
    toast({
      title: t('dataManagement.message.log3'),
      description: t('dataManagement.message.log4'),
      variant: "success",
    });
  };

  // 下载导出的数据为文件
  const handleDownload = () => {
    if (!exportedData) {
      handleExport();
    }
    
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(exportedData)}`;
    const exportFileName = `promptmate-backup-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  };

  // 直接导出提示词到文件
  const handleExportPrompts = () => {
    exportPromptsToFile();
    
    toast({
      title: t('dataManagement.message.exported'),
      description: t('dataManagement.message.exportedFile'),
      variant: "success",
    });
  };

  // 从输入区域导入数据
  const handleImport = () => {
    if (!importData.trim()) {
      toast({
        title: t('dataManagement.message.importFailed'),
        description: t('dataManagement.message.importFailedData'),
        variant: "destructive",
      });
      return;
    }
    
    try {
      const success = importAllData(importData);
      
      if (success) {
        toast({
          title: t('dataManagement.message.importSuccess'),
          description: t('dataManagement.message.importSuccessData'),
          variant: "success",
        });
        
        setImportData("");
        onDataChanged?.();
        onOpenChange?.(false);
      } else {
        toast({
          title: t('dataManagement.message.importFailed'),
          description: t('dataManagement.message.importFailedData'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('dataManagement.message.importFailedError'),
        description: t('dataManagement.message.importFailedError'),
        variant: "destructive",
      });
    }
  };

  // 从文件导入数据
  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setImportData(content);
        
        toast({
          title: t('dataManagement.message.importFile'),
          description: t('dataManagement.message.importFileDesc'),
          variant: "success",
        });
      } catch (error) {
        toast({
          title: t('dataManagement.message.importFileError'),
          description: t('dataManagement.message.importFileErrorDesc'),
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  };

  // 重置为默认数据
  const handleReset = () => {
    resetToDefaults();
    
    toast({
      title: t('dataManagement.message.resetSuccess'),
      description: t('dataManagement.message.resetSuccessData'),
      variant: "warning",
    });
    
    setShowConfirmReset(false);
    onDataChanged?.();
    onOpenChange?.(false);
  };

  // 渲染主内容
  const renderContent = () => (
    <div className="data-import-export-content">
      <div className="flex space-x-2 mb-4">
        <Button
          variant={activeTab === "export" ? "default" : "outline"}
          onClick={() => {
            console.log(t('dataManagement.message.exchangeTag'));
            setActiveTab("export");
          }}
          className="flex-1"
        >
          <Icons.upload className="mr-2 h-4 w-4" />
          {t('dataManagement.exportFile')}
        </Button>
        <Button
          variant={activeTab === "import" ? "default" : "outline"}
          onClick={() => {
            console.log(t('dataManagement.message.exchangeTag'));
            setActiveTab("import");
          }}
          className="flex-1"
        >
          <Icons.download className="mr-2 h-4 w-4" />
          {t('dataManagement.importFile')}
        </Button>
        <Button
          variant={activeTab === "sync" ? "default" : "outline"}
          onClick={() => setActiveTab("sync")}
          className="flex-1"
        >
          <Icons.refresh className="mr-2 h-4 w-4" />
          {t('dataManagement.sync')}
        </Button>
      </div>
      
      {activeTab === "export" && (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <Button onClick={handleExport} className="flex-1">
                <Icons.fileJson className="mr-2 h-4 w-4" />
                {t('dataManagement.exportData')}
              </Button>
              <Button onClick={handleDownload} className="flex-1" disabled={!exportedData}>
                <Icons.download className="mr-2 h-4 w-4" />
                {t('dataManagement.exportDataDescription')}
              </Button>
            </div>
            <Button onClick={handleExportPrompts} variant="outline">
              <Icons.fileExport className="mr-2 h-4 w-4" />
              {t('dataManagement.exportPrompts')}
            </Button>
          </div>
          
          {exportedData && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('dataManagement.exportDataDescription2')}</p>
              <Textarea
                value={exportedData}
                readOnly
                className="h-[200px] font-mono text-xs"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          )}
          
          <div className="pt-2">
            <Button 
              variant="destructive" 
              onClick={() => setShowConfirmReset(true)}
              className="w-full"
            >
              <Icons.trash className="mr-2 h-4 w-4" />
              {t('dataManagement.reset')}
            </Button>
          </div>
        </div>
      )}
      
      {activeTab === "import" && (
        <div className="space-y-4">
          <Alert>
            <Icons.alertCircle className="h-4 w-4" />
            <AlertTitle>{t('common.alertTitle')}</AlertTitle>
            <AlertDescription>
              {t('dataManagement.message.alertDescription')}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('dataManagement.message.pasteData')}</p>
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="h-[200px] font-mono text-xs"
              placeholder={t('dataManagement.message.pasteDataDesc')}
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex-1"
              >
                <Icons.fileUp className="mr-2 h-4 w-4" />
                {t('dataManagement.file')}
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFromFile}
              />
              <Button 
                onClick={handleImport} 
                className="flex-1"
                disabled={!importData.trim()}
              >
                <Icons.check className="mr-2 h-4 w-4" />
                {t('dataManagement.confirmImport')}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === "sync" && (
        <div className="space-y-4">
          <Alert>
            <Icons.info className="h-4 w-4" />
            <AlertTitle>{t('dataManagement.sync')}</AlertTitle>
            <AlertDescription>
              {t('dataManagement.syncDescription')}
            </AlertDescription>
          </Alert>
          
          {/* 同步状态指示器 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <SyncStatusIndicator />
              <div>
                <div className="font-medium">{t('dataManagement.syncStatus')}</div>
                <div className="text-sm text-muted-foreground">
                  {syncStatus.enabled ? t('dataManagement.syncEnabled') : t('dataManagement.syncDisabled')}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => toggleSync(!syncStatus.enabled)}
            >
              {syncStatus.enabled ? t('dataManagement.disableSync') : t('dataManagement.enableSync')}
            </Button>
          </div>
          
          {/* 同步操作 */}
          <div className="space-y-2">
            <Button
              onClick={handleManualSync}
              disabled={!syncStatus.enabled || syncStatus.syncing}
              className="w-full"
            >
              <Icons.refresh className={`mr-2 h-4 w-4 ${syncStatus.syncing ? 'animate-spin' : ''}`} />
              {syncStatus.syncing ? t('dataManagement.syncing') : t('dataManagement.manualSync')}
            </Button>
            
            {syncStatus.hasConflicts && (
              <Button
                variant="destructive"
                onClick={() => setShowConflictDialog(true)}
                className="w-full"
              >
                <Icons.alertTriangle className="mr-2 h-4 w-4" />
                {t('dataManagement.resolveConflicts')}
              </Button>
            )}
          </div>
          
          {/* 同步信息 */}
          {syncStatus.lastSync && (
            <div className="text-sm text-muted-foreground">
              {t('dataManagement.lastSync')}: {new Date(syncStatus.lastSync).toLocaleString()}
            </div>
          )}
          
          {syncStatus.error && (
            <Alert variant="destructive">
              <Icons.alertCircle className="h-4 w-4" />
              <AlertTitle>{t('common.error')}</AlertTitle>
              <AlertDescription>{syncStatus.error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      {!inline && (
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
              {t('common.close')}
          </Button>
        </DialogFooter>
      )}
    </div>
  );

  // 如果是内联模式，直接渲染内容
  if (inline) {
    return (
      <div className="data-import-export-inline">
        {renderContent()}
        
        {/* 确认重置对话框 */}
        <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('common.confirmReset')}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Alert variant="destructive">
                <Icons.alertTriangle className="h-4 w-4" />
                <AlertTitle>{t('common.warning')}</AlertTitle>
                <AlertDescription>
                  {t('dataManagement.message.resetWarning')}
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmReset(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleReset}>
                <Icons.trash className="mr-2 h-4 w-4" />
                {t('common.confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* 同步冲突对话框 */}
        <SyncConflictDialog
          conflict={pendingConflict}
          open={showConflictDialog}
          onOpenChange={setShowConflictDialog}
          onResolve={handleConflictResolve}
        />
      </div>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('dataManagement.title')}</DialogTitle>
          </DialogHeader>
          
          {renderContent()}
        </DialogContent>
      </Dialog>
      
      {/* 确认重置对话框 */}
      <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirmReset')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <Icons.alertTriangle className="h-4 w-4" />
              <AlertTitle>{t('common.warning')}</AlertTitle>
              <AlertDescription>
                {t('dataManagement.message.resetWarning')}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmReset(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              <Icons.trash className="mr-2 h-4 w-4" />
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 同步冲突对话框 */}
      <SyncConflictDialog
        conflict={pendingConflict}
        open={showConflictDialog}
        onOpenChange={setShowConflictDialog}
        onResolve={handleConflictResolve}
      />
    </>
  );
}