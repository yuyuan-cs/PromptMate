import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Icons } from './ui/icons';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ExternalLink, Download, Info, CheckCircle, AlertCircle } from 'lucide-react';

// 应用信息接口
interface AppInfo {
  version: string;
  name: string;
  description: string;
  author: {
    name: string;
    email: string;
  };
  homepage: string;
  repository: string;
  buildDate: string;
  electronVersion: string;
  nodeVersion: string;
  chromeVersion: string;
}

// 检查更新结果接口
interface UpdateResult {
  success: boolean;
  hasUpdate: boolean;
  currentVersion?: string;
  latestVersion?: string;
  releaseInfo?: {
    version: string;
    name: string;
    body: string;
    published_at: string;
    html_url: string;
    assets: any[];
  };
  updateType?: 'major' | 'minor' | 'patch';
  error?: string;
}

export function About() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
  
  // 加载应用信息
  useEffect(() => {
    const getAppInfo = async () => {
      try {
        if (window.electronAPI && typeof window.electronAPI.getAppInfo === 'function') {
          const info = await window.electronAPI.getAppInfo();
          setAppInfo(info);
        } else {
          // Web环境下的默认信息
          setAppInfo({
            version: '1.0.2',
            name: 'PromptMate',
            description: '帮助您创建和管理提示词的桌面应用',
            author: {
              name: '泺源',
              email: 'yuyuan3162021@163.com'
            },
            homepage: 'https://github.com/yy0691/PromptMate',
            repository: 'https://github.com/yy0691/PromptMate',
            buildDate: new Date().toISOString(),
            electronVersion: 'Web版本',
            nodeVersion: 'Web版本',
            chromeVersion: 'Web版本'
          });
        }
      } catch (error) {
        console.error('获取应用信息失败:', error);
        // 设置默认信息
        setAppInfo({
          version: '1.0.2',
          name: 'PromptMate',
          description: '帮助您创建和管理提示词的桌面应用',
          author: {
            name: '泺源',
            email: 'yuyuan3162021@163.com'
          },
          homepage: 'https://github.com/yy0691/PromptMate',
          repository: 'https://github.com/yy0691/PromptMate',
          buildDate: new Date().toISOString(),
          electronVersion: '未知',
          nodeVersion: '未知',
          chromeVersion: '未知'
        });
      }
    };
    
    getAppInfo();
  }, []);
  
  // 检查更新
  const checkForUpdates = async () => {
    // 检查是否在Electron环境中
    if (!window.electronAPI) {
      setUpdateStatus('在Web环境中无法检查更新，请在桌面应用中查看');
      toast.error('在Web环境中无法检查更新', {
        description: '请在桌面应用中查看更新信息'
      });
      return;
    }

    // 检查API是否可用
    if (typeof window.electronAPI.checkForUpdates !== 'function') {
      setUpdateStatus('更新检查功能不可用');
      toast.error('更新检查功能不可用', {
        description: '请确保使用最新版本的桌面应用'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setUpdateStatus('正在检查更新...');
      
      const result: UpdateResult = await window.electronAPI.checkForUpdates();
      setUpdateResult(result);
      
      if (result.success) {
        if (result.hasUpdate) {
          setUpdateStatus('发现新版本!');
          setUpdateAvailable(true);
          toast.success(`发现新版本: ${result.latestVersion}`, {
            description: `当前版本: ${result.currentVersion}`,
            action: {
              label: '查看详情',
              onClick: () => {
                if (result.releaseInfo?.html_url) {
                  window.open(result.releaseInfo.html_url, '_blank');
                }
              }
            }
          });
        } else {
          setUpdateStatus('已是最新版本');
          setUpdateAvailable(false);
          toast.info('当前已是最新版本', {
            description: `版本: ${result.currentVersion}`
          });
        }
      } else {
        setUpdateStatus(`检查更新失败: ${result.error || '未知错误'}`);
        toast.error(`检查更新失败: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      setUpdateStatus('检查更新出错');
      toast.error('检查更新出错', {
        description: error instanceof Error ? error.message : '未知错误'
      });
      console.error('检查更新出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取更新类型标签
  const getUpdateTypeLabel = (type?: string) => {
    switch (type) {
      case 'major':
        return { label: '主版本更新', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
      case 'minor':
        return { label: '次版本更新', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
      case 'patch':
        return { label: '补丁更新', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
      default:
        return { label: '未知', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' };
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 应用头部信息 */}
      <div className="flex items-center justify-center flex-col space-y-3 mb-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Icons.bot className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-xl">{appInfo?.name || 'PromptMate'}</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {appInfo?.description || '帮助您创建和管理提示词的桌面应用'}
          </p>
        </div>
      </div>

      {/* 版本信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            版本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">当前版本</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium">{appInfo?.version || '1.0.0'}</span>
                {updateResult?.hasUpdate && (
                  <Badge variant="destructive" className="text-xs">
                    有新版本
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">构建日期</Label>
              <div className="mt-1">
                {appInfo?.buildDate ? formatDate(appInfo.buildDate) : '未知'}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Electron版本</Label>
              <div className="mt-1">{appInfo?.electronVersion || '未知'}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Node.js版本</Label>
              <div className="mt-1">{appInfo?.nodeVersion || '未知'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 更新检查卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            检查更新
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={checkForUpdates} 
            disabled={isLoading || !window.electronAPI}
            className="w-full"
          >
            {isLoading && <Icons.loader className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <Icons.refresh className="mr-2 h-4 w-4" />}
            {!window.electronAPI ? 'Web环境不支持更新检查' : '检查更新'}
          </Button>
          
          {updateStatus && (
            <div className={`text-sm p-3 rounded-lg border ${
              updateAvailable 
                ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                : 'bg-muted/50 border-border'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {updateAvailable ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{updateStatus}</span>
              </div>
              
              {updateResult?.hasUpdate && updateResult.releaseInfo && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">最新版本:</span>
                    <span className="font-medium">{updateResult.latestVersion}</span>
                    <Badge className={getUpdateTypeLabel(updateResult.updateType).color}>
                      {getUpdateTypeLabel(updateResult.updateType).label}
                    </Badge>
                  </div>
                  
                  {updateResult.releaseInfo.name && (
                    <div>
                      <span className="text-muted-foreground">发布名称:</span>
                      <span className="ml-2">{updateResult.releaseInfo.name}</span>
                    </div>
                  )}
                  
                  {updateResult.releaseInfo.published_at && (
                    <div>
                      <span className="text-muted-foreground">发布时间:</span>
                      <span className="ml-2">{formatDate(updateResult.releaseInfo.published_at)}</span>
                    </div>
                  )}
                  
                  {updateResult.releaseInfo.html_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(updateResult.releaseInfo.html_url, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      查看发布详情
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 应用信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>应用信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <Label className="text-muted-foreground">开发者</Label>
              <div className="mt-1">{appInfo?.author?.name || '泺源'}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">项目地址</Label>
              <div className="mt-1">
                <Button
                  variant="link"
                  className="h-auto p-0 text-left"
                  onClick={() => window.open(appInfo?.repository || 'https://github.com/yy0691/PromptMate', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {appInfo?.repository || 'https://github.com/yy0691/PromptMate'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}