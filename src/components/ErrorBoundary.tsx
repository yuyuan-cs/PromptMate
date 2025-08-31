import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

// 错误日志记录函数
const logError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
  const errorLog = {
    id: errorId,
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    errorInfo: {
      componentStack: errorInfo.componentStack,
    },
    userAgent: navigator.userAgent,
    url: window.location.href,
    appVersion: process.env.REACT_APP_VERSION || 'unknown',
  };

  // 保存到本地存储
  try {
    const existingLogs = JSON.parse(localStorage.getItem('promptmate_error_logs') || '[]');
    existingLogs.push(errorLog);
    
    // 只保留最近50条错误日志
    if (existingLogs.length > 50) {
      existingLogs.splice(0, existingLogs.length - 50);
    }
    
    localStorage.setItem('promptmate_error_logs', JSON.stringify(existingLogs));
  } catch (e) {
    console.error('Failed to save error log:', e);
  }

  // 同时输出到控制台
  console.error('Application Error:', errorLog);
};

// 错误显示组件
const ErrorDisplay: React.FC<{
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  onReload: () => void;
  onReset: () => void;
}> = ({ error, errorInfo, errorId, onReload, onReset }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const errorDetails = JSON.stringify({
    id: errorId,
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    componentStack: errorInfo.componentStack,
  }, null, 2);

  const copyErrorDetails = async () => {
    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  const downloadErrorLog = () => {
    const blob = new Blob([errorDetails], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptmate-error-${errorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Icons.alertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            {t('errorBoundary.title')}
          </CardTitle>
          <CardDescription>
            {t('errorBoundary.description')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <Icons.alertCircle className="h-4 w-4" />
            <AlertTitle>{t('errorBoundary.errorOccurred')}</AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <p className="font-medium">{error.name}: {error.message}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('errorBoundary.errorId')}: {errorId}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onReload} className="flex-1">
              <Icons.refresh className="mr-2 h-4 w-4" />
              {t('errorBoundary.reload')}
            </Button>
            <Button onClick={onReset} variant="outline" className="flex-1">
              <Icons.rotateCcw className="mr-2 h-4 w-4" />
              {t('errorBoundary.reset')}
            </Button>
          </div>

          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              <Icons.info className="mr-2 h-4 w-4" />
              {showDetails ? t('errorBoundary.hideDetails') : t('errorBoundary.showDetails')}
            </Button>

            {showDetails && (
              <div className="space-y-3">
                <Textarea
                  value={errorDetails}
                  readOnly
                  className="h-64 font-mono text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={copyErrorDetails}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Icons.copy className="mr-2 h-4 w-4" />
                    {copied ? t('errorBoundary.copied') : t('errorBoundary.copyDetails')}
                  </Button>
                  <Button
                    onClick={downloadErrorLog}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Icons.download className="mr-2 h-4 w-4" />
                    {t('errorBoundary.downloadLog')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>{t('errorBoundary.supportInfo')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

class ErrorBoundary extends Component<Props, State> {
  private errorId: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
    this.errorId = '';
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error,
      errorInfo,
      errorId: this.errorId,
    });

    // 记录错误日志
    logError(error, errorInfo, this.errorId);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    // 清除本地存储中的应用数据（保留错误日志）
    const errorLogs = localStorage.getItem('promptmate_error_logs');
    localStorage.clear();
    if (errorLogs) {
      localStorage.setItem('promptmate_error_logs', errorLogs);
    }
    
    // 重新加载页面
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onReload={this.handleReload}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { ErrorBoundary };
