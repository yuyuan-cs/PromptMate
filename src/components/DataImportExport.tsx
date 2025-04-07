import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { exportAllData, importAllData, exportPromptsToFile, resetToDefaults } from "@/lib/data";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

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
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");

  // 组件挂载时强制渲染
  useEffect(() => {
    // 确保组件首次渲染时内容可见
    const forceRender = () => {};
    forceRender();
    
    console.log('DataImportExport 组件已挂载:', { inline, activeTab, open });
  }, []);
  
  // 主动监听标签页变化
  useEffect(() => {
    console.log('数据管理标签页切换:', activeTab);
  }, [activeTab]);
  
  // 生成导出数据
  const handleExport = () => {
    const data = exportAllData();
    setExportedData(data);
    
    toast({
      title: "数据已准备就绪",
      description: "您可以复制数据或下载为JSON文件",
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
      title: "提示词已导出",
      description: "提示词已成功导出为JSON文件",
      variant: "success",
    });
  };

  // 从输入区域导入数据
  const handleImport = () => {
    if (!importData.trim()) {
      toast({
        title: "导入失败",
        description: "请先输入要导入的JSON数据",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const success = importAllData(importData);
      
      if (success) {
        toast({
          title: "导入成功",
          description: "数据已成功导入",
          variant: "success",
        });
        
        setImportData("");
        onDataChanged?.();
        onOpenChange?.(false);
      } else {
        toast({
          title: "导入失败",
          description: "无法导入数据，请检查JSON格式是否正确",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "导入出错",
        description: "导入过程中出现错误",
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
          title: "文件已加载",
          description: "请点击导入按钮完成导入",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "读取文件失败",
          description: "无法读取选择的文件",
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
      title: "重置成功",
      description: "所有数据已重置为默认值",
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
            console.log('切换到导出标签');
            setActiveTab("export");
          }}
          className="flex-1"
        >
          <Icons.upload className="mr-2 h-4 w-4" />
          导出数据
        </Button>
        <Button
          variant={activeTab === "import" ? "default" : "outline"}
          onClick={() => {
            console.log('切换到导入标签');
            setActiveTab("import");
          }}
          className="flex-1"
        >
          <Icons.download className="mr-2 h-4 w-4" />
          导入数据
        </Button>
      </div>
      
      {activeTab === "export" && (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <Button onClick={handleExport} className="flex-1">
                <Icons.fileJson className="mr-2 h-4 w-4" />
                生成导出数据
              </Button>
              <Button onClick={handleDownload} className="flex-1" disabled={!exportedData}>
                <Icons.download className="mr-2 h-4 w-4" />
                下载为JSON文件
              </Button>
            </div>
            <Button onClick={handleExportPrompts} variant="outline">
              <Icons.fileExport className="mr-2 h-4 w-4" />
              仅导出提示词
            </Button>
          </div>
          
          {exportedData && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">导出的数据（可复制）：</p>
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
              重置为默认数据
            </Button>
          </div>
        </div>
      )}
      
      {activeTab === "import" && (
        <div className="space-y-4">
          <Alert>
            <Icons.alertCircle className="h-4 w-4" />
            <AlertTitle>注意</AlertTitle>
            <AlertDescription>
              导入数据将覆盖当前的所有提示词和分类。请确保您已备份重要数据。
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">粘贴要导入的JSON数据：</p>
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="h-[200px] font-mono text-xs"
              placeholder="粘贴JSON格式的提示词数据..."
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
                从文件导入
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
                确认导入
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {!inline && (
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            关闭
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
              <DialogTitle>确认重置数据</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Alert variant="destructive">
                <Icons.alertTriangle className="h-4 w-4" />
                <AlertTitle>警告</AlertTitle>
                <AlertDescription>
                  此操作将删除所有自定义提示词和分类，并恢复到默认状态。此操作无法撤销。
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmReset(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleReset}>
                <Icons.trash className="mr-2 h-4 w-4" />
                确认重置
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>数据导入导出</DialogTitle>
          </DialogHeader>
          
          {renderContent()}
        </DialogContent>
      </Dialog>
      
      {/* 确认重置对话框 */}
      <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认重置数据</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <Icons.alertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                此操作将删除所有自定义提示词和分类，并恢复到默认状态。此操作无法撤销。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmReset(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              <Icons.trash className="mr-2 h-4 w-4" />
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 