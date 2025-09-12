import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { exportAllData, importAllData, resetToDefaults } from "@/lib/data";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DataImportExportProps {
  onDataChanged?: () => void;
}

export function DataImportExport({ onDataChanged }: DataImportExportProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // 导出全部数据
  const handleExportAllData = () => {
    try {
      const dataStr = exportAllData();
      if (!dataStr) {
        throw new Error("Failed to generate export data.");
      }
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      const exportFileName = `promptmate-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();

      toast({
        title: t('dataManagement.message.exported'),
        description: t('dataManagement.message.exportedFile'),
        variant: "success",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "导出失败",
        description: "无法生成导出文件，请检查控制台日志。",
        variant: "destructive",
      });
    }
  };

  // 从文件导入数据
  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
          throw new Error("File content is empty.");
        }
        const success = await importAllData(content);
        if (success) {
          toast({
            title: t('dataManagement.message.importSuccess'),
            description: t('dataManagement.message.importSuccessData'),
            variant: "success",
          });
          setTimeout(() => onDataChanged?.(), 100);
        } else {
          throw new Error("Import failed, see console for details.");
        const importData = JSON.parse(content);

        // 保存categories to database
        if (importData.categories && importData.categories.length > 0) {
          for (const category of importData.categories) {
            try {
              await (window as any).electronAPI?.updateDatabaseCategory(category);
            } catch (error) {
              console.warn('分类迁移失败:', category.id, error.message);
            }
          }
        }
        
        toast({
          title: t('dataManagement.message.importSuccess'),
          description: t('dataManagement.message.importSuccessData'),
          variant: "success",
        });
        setTimeout(() => onDataChanged?.(), 100);
      } catch (error) {
        console.error("Import failed:", error);
        toast({
          title: t('dataManagement.message.importFailedError'),
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const triggerFileSelect = () => {
    document.getElementById('import-file-input')?.click();
  };

  const handleReset = async () => {
    try {
      await resetToDefaults();
      toast({
        title: t('dataManagement.message.resetSuccess'),
        description: t('dataManagement.message.resetSuccessData'),
        variant: "warning",
      });
      setShowConfirmReset(false);
      setTimeout(() => onDataChanged?.(), 100);
    } catch (error) {
      console.error('重置数据失败:', error);
      toast({
        title: t('dataManagement.message.resetError'),
        description: t('dataManagement.message.resetErrorData'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <input id="import-file-input" type="file" accept=".json" className="hidden" onChange={handleImportFromFile} />

      <Card>
        <CardHeader>
          <CardTitle>{t('dataManagement.backupRestore')}</CardTitle>
          <CardDescription>{t('dataManagement.backupRestoreDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={handleExportAllData} className="w-full">
            <Icons.fileExport className="mr-2 h-4 w-4" />
            {t('dataManagement.exportData')}
          </Button>
          <Button onClick={triggerFileSelect} variant="outline" className="w-full">
            <Icons.fileUp className="mr-2 h-4 w-4" />
            {t('dataManagement.importData')}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t('dataManagement.dangerousOperations')}</CardTitle>
          <CardDescription>{t('dataManagement.dangerousOperationsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setShowConfirmReset(true)} className="w-full">
            <Icons.trash className="mr-2 h-4 w-4" />
            {t('dataManagement.resetToDefaults')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirmReset')}</DialogTitle>
            <Alert variant="destructive" className="mt-4">
              <Icons.alertTriangle className="h-4 w-4" />
              <AlertTitle>{t('common.warning')}</AlertTitle>
              <AlertDescription>{t('dataManagement.message.resetWarning')}</AlertDescription>
            </Alert>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmReset(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleReset}>
              <Icons.trash className="mr-2 h-4 w-4" />
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

}