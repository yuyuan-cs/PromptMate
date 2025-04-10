import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Icons } from './ui/icons';
import { Label } from './ui/label';
import { toast } from 'sonner';

// 应用信息接口
interface AppInfo {
  version: string;
  name: string;
  description: string;
}

// 检查更新结果接口
interface UpdateResult {
  success: boolean;
  hasUpdate: boolean;
  version?: string;
  error?: string;
}

export function About() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState<string | null>(null);
  
  // 加载应用信息
  useEffect(() => {
    const getAppInfo = async () => {
      try {
        if (window.electronAPI) {
          const info = await window.electronAPI.getAppInfo();
          setAppInfo(info);
        }
      } catch (error) {
        console.error('获取应用信息失败:', error);
      }
    };
    
    getAppInfo();
  }, []);
  
  // 检查更新
  const checkForUpdates = async () => {
    if (!window.electronAPI) {
      setUpdateStatus('在Web环境中无法检查更新');
      return;
    }
    
    try {
      setIsLoading(true);
      setUpdateStatus('正在检查更新...');
      
      const result: UpdateResult = await window.electronAPI.checkForUpdates();
      
      if (result.success) {
        if (result.hasUpdate) {
          setUpdateStatus('发现新版本!');
          setUpdateAvailable(true);
          setNewVersion(result.version || null);
          toast.success(`发现新版本: ${result.version}`);
        } else {
          setUpdateStatus('已是最新版本');
          setUpdateAvailable(false);
          toast.info('当前已是最新版本');
        }
      } else {
        setUpdateStatus(`检查更新失败: ${result.error || '未知错误'}`);
        toast.error(`检查更新失败: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      setUpdateStatus('检查更新出错');
      toast.error('检查更新出错');
      console.error('检查更新出错:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center flex-col space-y-2 mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Icons.bot className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-medium text-lg">{appInfo?.name || 'PromptMate'}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {appInfo?.description || '帮助您创建和管理提示词的桌面应用'}
        </p>
      </div>

      <div className="grid gap-2">
        <Label>版本信息</Label>
        <div className="flex items-center rounded-md border px-3 py-2 text-sm">
          <span className="text-muted-foreground mr-2">当前版本:</span>
          <span>{appInfo?.version || '1.0.0'}</span>
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label>检查更新</Label>
        <div className="space-y-2">
          <Button 
            onClick={checkForUpdates} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Icons.loader className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <Icons.refresh className="mr-2 h-4 w-4" />}
            检查更新
          </Button>
          
          {updateStatus && (
            <div className={`text-sm p-2 rounded ${
              updateAvailable 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'text-muted-foreground'
            }`}>
              {updateStatus}
              {updateAvailable && newVersion && (
                <div className="mt-1">
                  新版本: {newVersion}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid gap-2 mt-6">
        <Label>关于作者</Label>
        <div className="text-sm text-muted-foreground rounded-md border px-3 py-2">
          <p className="mb-2">作者: 泺源</p>
          <p className="mb-2">邮箱: yuyuan3162021@163.com</p>
          <a 
            href="https://github.com/yy0691/PromptMate" 
            target="_blank" 
            rel="noreferrer"
            className="text-primary flex items-center hover:underline"
          >
            <Icons.github className="mr-1 h-4 w-4" />
            GitHub 项目
          </a>
        </div>
      </div>
    </div>
  );
}