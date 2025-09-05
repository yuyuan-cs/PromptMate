import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';

interface NotFoundPageProps {
  error?: string;
  onGoHome?: () => void;
  onReload?: () => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({
  error,
  onGoHome,
  onReload
}) => {
  const { t } = useTranslation();

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  const handleReportIssue = () => {
    // 收集错误信息
    const errorInfo = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: error || 'Page not found',
      appVersion: import.meta.env.VITE_APP_VERSION || 'unknown',
    };

    // 创建 GitHub issue URL
    const issueTitle = encodeURIComponent(`404 Error: ${error || 'Page not found'}`);
    const issueBody = encodeURIComponent(`
## 错误描述
页面无法找到或加载失败

## 错误信息
\`\`\`json
${JSON.stringify(errorInfo, null, 2)}
\`\`\`

## 复现步骤
1. 访问页面: ${window.location.href}
2. 遇到404错误

## 期望行为
页面应该正常加载

## 实际行为
显示404错误页面
    `);

    const githubUrl = `https://github.com/your-username/PromptMate/issues/new?title=${issueTitle}&body=${issueBody}`;
    window.open(githubUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Icons.fileX className="h-24 w-24 text-muted-foreground" />
          </div>
          <CardTitle className="text-4xl font-bold text-muted-foreground">
            404
          </CardTitle>
          <CardDescription className="text-lg">
            {t('notFound.title')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-muted-foreground">
            <p>{t('notFound.description')}</p>
            {error && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{t('notFound.errorDetails')}:</p>
                <p className="text-xs mt-1 font-mono break-all">{error}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleGoHome} className="flex-1">
              <Icons.home className="mr-2 h-4 w-4" />
              {t('notFound.goHome')}
            </Button>
            <Button onClick={handleReload} variant="outline" className="flex-1">
              <Icons.refresh className="mr-2 h-4 w-4" />
              {t('notFound.reload')}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleReportIssue}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <Icons.bug className="mr-2 h-4 w-4" />
              {t('notFound.reportIssue')}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>{t('notFound.supportInfo')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
export { NotFoundPage };
