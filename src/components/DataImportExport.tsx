import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { exportAllData, importAllData, resetToDefaults, generateId } from "@/lib/data";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import * as XLSX from 'xlsx';
import { Prompt } from "@/types";

interface DataImportExportProps {
  onDataChanged?: () => void;
}

interface ImportProgress {
  isImporting: boolean;
  progress: number;
  currentStep: string;
  totalSteps: number;
  currentStepIndex: number;
}

export function DataImportExport({ onDataChanged }: DataImportExportProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    isImporting: false,
    progress: 0,
    currentStep: '',
    totalSteps: 0,
    currentStepIndex: 0
  });

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

  // 验证导入数据结构
  const validateImportData = (data: any): { isValid: boolean; error?: string } => {
    try {
      if (!data) {
        return { isValid: false, error: "导入数据为空" };
      }

      // 检查是否是完整备份格式
      if (data.prompts && data.categories) {
        if (!Array.isArray(data.prompts) || !Array.isArray(data.categories)) {
          return { isValid: false, error: "数据格式错误：prompts和categories必须是数组" };
        }
        
        // 验证分类数据结构
        for (const category of data.categories) {
          if (!category.id || !category.name) {
            return { isValid: false, error: "分类数据缺少必要字段（id或name）" };
          }
        }
        
        // 验证提示词数据结构
        for (const prompt of data.prompts) {
          if (!prompt.id || !prompt.title || !prompt.content) {
            return { isValid: false, error: "提示词数据缺少必要字段（id、title或content）" };
          }
        }
        
        return { isValid: true };
      }
      
      // 检查是否是仅提示词数组格式
      if (Array.isArray(data)) {
        for (const prompt of data) {
          if (!prompt.title || !prompt.content) {
            return { isValid: false, error: "提示词数据缺少必要字段（title或content）" };
          }
        }
        return { isValid: true };
      }
      
      return { isValid: false, error: "无法识别的数据格式" };
    } catch (error) {
      return { isValid: false, error: `数据验证失败: ${(error as Error).message}` };
    }
  };

  // 更新导入进度
  const updateProgress = (stepIndex: number, stepName: string, totalSteps: number) => {
    const progress = Math.round((stepIndex / totalSteps) * 100);
    setImportProgress({
      isImporting: true,
      progress,
      currentStep: stepName,
      totalSteps,
      currentStepIndex: stepIndex
    });
  };

  // 解析CSV数据
  const parseCSV = (csvText: string): Prompt[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV文件格式错误：至少需要标题行和一行数据');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const requiredHeaders = ['title', 'content', 'category'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`CSV文件缺少必要列：${missingHeaders.join(', ')}`);
    }

    const prompts: Prompt[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length !== headers.length) continue;

      const prompt: any = {};
      headers.forEach((header, index) => {
        prompt[header] = values[index];
      });

      if (!prompt.title || !prompt.content) continue;

      prompts.push({
        id: generateId(),
        title: prompt.title,
        content: prompt.content,
        category: prompt.category || 'general',
        tags: prompt.tags ? prompt.tags.split(';').filter(t => t.trim()) : [],
        isFavorite: false,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return prompts;
  };

  // 解析Excel数据
  const parseExcel = (file: File): Promise<Prompt[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

          if (jsonData.length < 2) {
            throw new Error('Excel文件格式错误：至少需要标题行和一行数据');
          }

          const headers = jsonData[0].map(h => String(h).toLowerCase());
          const requiredHeaders = ['title', 'content', 'category'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            throw new Error(`Excel文件缺少必要列：${missingHeaders.join(', ')}`);
          }

          const prompts: Prompt[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const prompt: any = {};
            headers.forEach((header, index) => {
              prompt[header] = row[index] ? String(row[index]) : '';
            });

            if (!prompt.title || !prompt.content) continue;

            prompts.push({
              id: generateId(),
              title: prompt.title,
              content: prompt.content,
              category: prompt.category || 'general',
              tags: prompt.tags ? String(prompt.tags).split(';').filter(t => t.trim()) : [],
              isFavorite: false,
              version: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }

          resolve(prompts);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  };

  // 从文件导入数据
  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    if (fileExtension === 'json') {
      handleJSONImport(file);
    } else if (fileExtension === 'csv') {
      handleCSVImport(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      handleExcelImport(file);
    } else {
      toast({
        title: "不支持的文件格式",
        description: "请选择JSON、CSV或Excel文件",
        variant: "destructive",
      });
    }
    
    event.target.value = '';
  };

  // 处理JSON导入
  const handleJSONImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setImportProgress({
          isImporting: true,
          progress: 0,
          currentStep: '正在读取JSON文件...',
          totalSteps: 4,
          currentStepIndex: 0
        });

        const content = e.target?.result as string;
        if (!content) {
          throw new Error("文件内容为空");
        }

        updateProgress(1, '正在解析JSON数据...', 4);
        let importData;
        try {
          importData = JSON.parse(content);
        } catch (parseError) {
          throw new Error("JSON文件格式错误，请确保是有效的JSON文件");
        }

        updateProgress(2, '正在验证数据格式...', 4);
        const validation = validateImportData(importData);
        if (!validation.isValid) {
          throw new Error(validation.error || "数据格式验证失败");
        }

        updateProgress(3, '正在导入数据...', 4);
        const success = await importAllData(content);
        
        if (success) {
          updateProgress(4, '导入完成', 4);
          toast({
            title: t('dataManagement.message.importSuccess'),
            description: t('dataManagement.message.importSuccessData'),
            variant: "success",
          });
          
          setTimeout(() => {
            setImportProgress({
              isImporting: false,
              progress: 0,
              currentStep: '',
              totalSteps: 0,
              currentStepIndex: 0
            });
            onDataChanged?.();
          }, 1000);
        } else {
          throw new Error("导入失败，请查看控制台获取详细信息");
        }
      } catch (error) {
        console.error("JSON Import failed:", error);
        resetImportProgress();
        toast({
          title: t('dataManagement.message.importFailedError'),
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = () => {
      resetImportProgress();
      toast({
        title: "文件读取失败",
        description: "无法读取选择的文件，请重试",
        variant: "destructive",
      });
    };
    
    reader.readAsText(file);
  };

  // 处理CSV导入
  const handleCSVImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setImportProgress({
          isImporting: true,
          progress: 0,
          currentStep: '正在读取CSV文件...',
          totalSteps: 4,
          currentStepIndex: 0
        });

        const content = e.target?.result as string;
        if (!content) {
          throw new Error("CSV文件内容为空");
        }

        updateProgress(1, '正在解析CSV数据...', 4);
        const prompts = parseCSV(content);
        
        if (prompts.length === 0) {
          throw new Error("CSV文件中没有有效的提示词数据");
        }

        updateProgress(2, '正在验证数据...', 4);
        updateProgress(3, `正在导入${prompts.length}条提示词...`, 4);
        
        const jsonData = JSON.stringify(prompts);
        const success = await importAllData(jsonData);
        
        if (success) {
          updateProgress(4, '导入完成', 4);
          toast({
            title: "CSV导入成功",
            description: `成功导入${prompts.length}条提示词`,
            variant: "success",
          });
          
          setTimeout(() => {
            resetImportProgress();
            onDataChanged?.();
          }, 1000);
        } else {
          throw new Error("导入失败，请查看控制台获取详细信息");
        }
      } catch (error) {
        console.error("CSV Import failed:", error);
        resetImportProgress();
        toast({
          title: "CSV导入失败",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = () => {
      resetImportProgress();
      toast({
        title: "文件读取失败",
        description: "无法读取CSV文件，请重试",
        variant: "destructive",
      });
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  // 处理Excel导入
  const handleExcelImport = async (file: File) => {
    try {
      setImportProgress({
        isImporting: true,
        progress: 0,
        currentStep: '正在读取Excel文件...',
        totalSteps: 4,
        currentStepIndex: 0
      });

      updateProgress(1, '正在解析Excel数据...', 4);
      const prompts = await parseExcel(file);
      
      if (prompts.length === 0) {
        throw new Error("Excel文件中没有有效的提示词数据");
      }

      updateProgress(2, '正在验证数据...', 4);
      updateProgress(3, `正在导入${prompts.length}条提示词...`, 4);
      
      const jsonData = JSON.stringify(prompts);
      const success = await importAllData(jsonData);
      
      if (success) {
        updateProgress(4, '导入完成', 4);
        toast({
          title: "Excel导入成功",
          description: `成功导入${prompts.length}条提示词`,
          variant: "success",
        });
        
        setTimeout(() => {
          resetImportProgress();
          onDataChanged?.();
        }, 1000);
      } else {
        throw new Error("导入失败，请查看控制台获取详细信息");
      }
    } catch (error) {
      console.error("Excel Import failed:", error);
      resetImportProgress();
      toast({
        title: "Excel导入失败",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // 重置导入进度
  const resetImportProgress = () => {
    setImportProgress({
      isImporting: false,
      progress: 0,
      currentStep: '',
      totalSteps: 0,
      currentStepIndex: 0
    });
  };

  const triggerFileSelect = () => {
    document.getElementById('import-file-input')?.click();
  };

  // 下载CSV模板
  const downloadCSVTemplate = () => {
    const csvContent = `title,content,category,tags
"示例标题","这是一个示例提示词内容","general","示例;标签"
"编程助手","请帮我写一个Python函数","programming","编程;Python"
"文案写作","请帮我写一篇关于AI的文章","writing","文案;AI"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'promptmate-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "模板下载成功",
      description: "CSV模板已下载，请按照格式填写数据",
      variant: "success",
    });
  };

  // 下载Excel模板
  const downloadExcelTemplate = () => {
    const data = [
      ['title', 'content', 'category', 'tags'],
      ['示例标题', '这是一个示例提示词内容', 'general', '示例;标签'],
      ['编程助手', '请帮我写一个Python函数', 'programming', '编程;Python'],
      ['文案写作', '请帮我写一篇关于AI的文章', 'writing', '文案;AI']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prompts');
    
    // 设置列宽
    const colWidths = [{ wch: 20 }, { wch: 50 }, { wch: 15 }, { wch: 20 }];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, 'promptmate-template.xlsx');
    
    toast({
      title: "模板下载成功",
      description: "Excel模板已下载，请按照格式填写数据",
      variant: "success",
    });
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
      <input id="import-file-input" type="file" accept=".json,.csv,.xlsx,.xls" className="hidden" onChange={handleImportFromFile} />

      <Card>
        <CardHeader>
          <CardTitle>{t('dataManagement.backupRestore')}</CardTitle>
          <CardDescription>{t('dataManagement.backupRestoreDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleExportAllData} className="w-full">
              <Icons.fileExport className="mr-2 h-4 w-4" />
              {t('dataManagement.exportData')}
            </Button>
            <Button 
              onClick={triggerFileSelect} 
              variant="outline" 
              className="w-full"
              disabled={importProgress.isImporting}
            >
              {importProgress.isImporting ? (
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.fileUp className="mr-2 h-4 w-4" />
              )}
              {importProgress.isImporting ? '导入中...' : t('dataManagement.importData')}
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="text-sm text-muted-foreground flex-1">
              支持格式：JSON、CSV、Excel (.xlsx/.xls)
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Icons.download className="mr-2 h-4 w-4" />
                  下载模板
                  <Icons.chevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={downloadCSVTemplate}>
                  <Icons.file className="mr-2 h-4 w-4" />
                  CSV 模板
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadExcelTemplate}>
                  <Icons.fileText className="mr-2 h-4 w-4" />
                  Excel 模板
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
        {importProgress.isImporting && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{importProgress.currentStep}</span>
                <span>{importProgress.progress}%</span>
              </div>
              <Progress value={importProgress.progress} className="w-full" />
            </div>
          </CardContent>
        )}
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