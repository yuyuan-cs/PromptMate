import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Icons } from './ui/icons';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ExternalLink, Download, Info, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 假设您使用的是 react-i18next

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
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const { t } = useTranslation();
  // 加载应用信息
  useEffect(() => {
    const getAppInfo = async () => {
      try {
        if (window.electronAPI && typeof window.electronAPI.getAppInfo === 'function') {
          const info = await window.electronAPI.getAppInfo();
          setAppInfo(info);
        } else {
          // Web环境下的默认信息 - 尝试从package.json获取
          try {
            // 在Web环境下，我们可以尝试从环境变量或其他方式获取版本信息
            const webVersion = import.meta.env.VITE_APP_VERSION || '1.0.14';
            const webBuildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString();
            
            setAppInfo({
              version: webVersion,
              name: 'PromptMate',
              description: t("about.description"),
              author: {
                name: t("about.author"),
                email: 'yuyuan3162021@163.com'
              },
              homepage: 'https://github.com/yy0691/PromptMate',
              repository: 'https://github.com/yy0691/PromptMate',
              buildDate: webBuildDate,
              electronVersion: import.meta.env.VITE_ELECTRON_VERSION || t("about.version.webVersion"),
              nodeVersion: import.meta.env.VITE_NODE_VERSION || t("about.version.webVersion"),
              chromeVersion: import.meta.env.VITE_CHROME_VERSION || t("about.version.webVersion")
            });
          } catch (error) {
            // 如果无法获取，使用默认值
            setAppInfo({
              version: '1.0.14',
              name: 'PromptMate',
              description: t("about.description"),
              author: {
                name: t("about.author"),
                email: 'yuyuan3162021@163.com'
              },
              homepage: 'https://github.com/yy0691/PromptMate',
              repository: 'https://github.com/yy0691/PromptMate',
              buildDate: new Date().toISOString(),
              electronVersion: import.meta.env.VITE_ELECTRON_VERSION || t("about.version.webVersion"),
              nodeVersion: import.meta.env.VITE_NODE_VERSION || t("about.version.webVersion"),
              chromeVersion: import.meta.env.VITE_CHROME_VERSION || t("about.version.webVersion")
            });
          }
        }
      } catch (error) {
        console.error('获取应用信息失败:', error);
        // 设置默认信息
        setAppInfo({
          version: '1.0.14',
          name: 'PromptMate',
          description: t("about.description"),
          author: {
            name: t("about.author"),
            email: 'yuyuan3162021@163.com'
          },
          homepage: 'https://github.com/yy0691/PromptMate',
          repository: 'https://github.com/yy0691/PromptMate',
          buildDate: new Date().toISOString(),
          electronVersion: t("about.unknown"),
          nodeVersion: t("about.unknown"),
          chromeVersion: t("about.unknown")
        });
      }
    };
    
    getAppInfo();
  }, []);
  
  // 检查更新
  const checkForUpdates = async () => {
    // 检查是否在Electron环境中
    if (!window.electronAPI) {
      setUpdateStatus(t("about.checkForUpdates.error.web"));
      toast.error(t("about.checkForUpdates.error.web"), {
        description: t("about.checkForUpdates.error.desktop")
      });
      return;
    }

    // 检查API是否可用
    if (typeof window.electronAPI.checkForUpdates !== 'function') {
      setUpdateStatus(t("about.checkForUpdates.error.unavailable"));
      toast.error(t("about.checkForUpdates.error.unavailable"), {
        description: t("about.checkForUpdates.error.desktop")
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setUpdateStatus(t("about.checkForUpdates.checking"));
      setLastCheckTime(new Date());
      
      const result: UpdateResult = await window.electronAPI.checkForUpdates();
      setUpdateResult(result);
      
      if (result.success) {
        if (result.hasUpdate) {
          setUpdateStatus(t("about.checkForUpdates.newVersion"));
          setUpdateAvailable(true);
          toast.success(t("about.checkForUpdates.newVersion"), {
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
          setUpdateStatus(t("about.checkForUpdates.upToDate"));
          setUpdateAvailable(false);
          toast.info(t("about.checkForUpdates.upToDate"), {
            description: `版本: ${result.currentVersion}`
          });
        }
      } else {
        setUpdateStatus(t("about.checkForUpdates.error.checkFailed"));
        toast.error(t("about.checkForUpdates.error.checkFailed"));
      }
    } catch (error) {
      setUpdateStatus(t("about.checkForUpdates.error.checkFailed"));
      toast.error(t("about.checkForUpdates.error.checkFailed"), {
        description: error instanceof Error ? error.message : t("about.checkForUpdates.error.unknown")
      });
      console.error('检查更新出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 下载更新
  const downloadUpdate = async () => {
    // 检查是否在Electron环境中
    if (!window.electronAPI) {
      toast.error("下载更新功能仅在桌面版中可用", {
        description: "请访问GitHub下载最新版本"
      });
      return;
    }

    // 检查API是否可用
    if (typeof window.electronAPI.downloadUpdate !== 'function') {
      toast.error("下载更新功能不可用", {
        description: "请手动访问GitHub下载最新版本"
      });
      return;
    }
    
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      
      const result = await window.electronAPI.downloadUpdate();
      
      if (result.success) {
        if (result.downloadUrl) {
          toast.success("已打开下载链接", {
            description: `版本 ${result.version} 的下载已在浏览器中打开`
          });
        } else {
          toast.success("开始下载更新", {
            description: `正在下载版本 ${result.version}，请稍候...`
          });
        }
      } else {
        toast.error("下载更新失败", {
          description: result.error || "未知错误"
        });
      }
    } catch (error) {
      console.error('下载更新失败:', error);
      toast.error("下载更新失败", {
        description: error instanceof Error ? error.message : "未知错误"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '未知日期';
    }
  };

  // 获取更新类型标签
  const getUpdateTypeLabel = (type?: string) => {
    switch (type) {
      case 'major':
        return { label: t("about.majorversion"), color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
      case 'minor':
        return { label: t("about.minorversion"), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
      case 'patch':
        return { label: t("about.patchversion"), color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
      default:
        return { label: t("about.unknown"), color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' };
    }
  };

  // 获取版本状态
  const getVersionStatus = () => {
    if (!updateResult) return null;
    
    if (updateResult.hasUpdate) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs">
            {t("about.updateAvailable")} {updateResult.latestVersion}
          </Badge>
          <Badge className={getUpdateTypeLabel(updateResult.updateType).color}>
            {getUpdateTypeLabel(updateResult.updateType).label}
          </Badge>
        </div>
      );
    }
    
    return (
      <Badge variant="secondary" className="text-xs">
        {t("about.updateNotAvailable")}
      </Badge>
    );
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
            {t("about.version.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">{t("about.version.currentVersion")}</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium">{appInfo?.version || '1.0.14'}</span>
                {getVersionStatus()}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("about.version.buildDate")}</Label>
              <div className="mt-1">
                {appInfo?.buildDate ? formatDate(appInfo.buildDate) : t("about.unknown")}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("about.version.electronVersion")}</Label>
              <div className="mt-1">{appInfo?.electronVersion || t("about.unknown")}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("about.version.nodeVersion")}</Label>
              <div className="mt-1">{appInfo?.nodeVersion || t("about.unknown")}</div>
            </div>
          </div>
          
          {/* 版本状态信息 */}
          {updateResult && (
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                {t("about.version.lastCheckTime")}: {lastCheckTime ? formatDate(lastCheckTime.toISOString()) : t("about.unknown")}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 更新检查卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t("about.update")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={checkForUpdates} 
              disabled={isLoading || !window.electronAPI}
              className="flex-1"
            >
              {isLoading && <Icons.loader className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoading && <RefreshCw className="mr-2 h-4 w-4" />}
              {!window.electronAPI ? t("about.updateCheckingError") : t("about.update")}
            </Button>
            
            {window.electronAPI && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://github.com/yy0691/PromptMate/releases', '_blank')}
                className="shrink-0"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("about.viewReleasePage")}
              </Button>
            )}
          </div>
          
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
                    <span className="text-muted-foreground">{t("about.updateAvailable")}</span>
                    <span className="font-medium">{updateResult.latestVersion}</span>
                    <Badge className={getUpdateTypeLabel(updateResult.updateType).color}>
                      {getUpdateTypeLabel(updateResult.updateType).label}
                    </Badge>
                  </div>
                  
                  {updateResult.releaseInfo.name && (
                    <div>
                      <span className="text-muted-foreground">{t("about.releaseName")}</span>
                      <span className="ml-2">{updateResult.releaseInfo.name}</span>
                    </div>
                  )}
                  
                  {updateResult.releaseInfo.published_at && (
                    <div>
                      <span className="text-muted-foreground">{t("about.releaseDate")}</span>
                      <span className="ml-2">{formatDate(updateResult.releaseInfo.published_at)}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-2">
                    {updateResult.releaseInfo.html_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(updateResult.releaseInfo.html_url, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t("about.viewReleaseDetails")}
                      </Button>
                    )}
                    
                    {window.electronAPI && typeof window.electronAPI.downloadUpdate === 'function' && (
                      <Button
                        variant="default"
                        size="sm"
                        disabled={isDownloading}
                        onClick={downloadUpdate}
                      >
                        {isDownloading ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                            {t("about.downloading")}
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            {t("about.downloadUpdate")}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 应用信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>{t("about.appInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <Label className="text-muted-foreground">{t("about.author")}</Label>
              <div className="mt-1">{appInfo?.author?.name || t("about.author")}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("about.repository")}</Label>
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