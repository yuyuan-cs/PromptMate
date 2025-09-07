import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Bug, RefreshCw, FileQuestion } from 'lucide-react';

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
    // Collect error information
    const errorInfo = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: error || 'Page not found',
    };

    // Create GitHub issue URL
    const issueTitle = encodeURIComponent(`404 Error: ${error || 'Page not found'}`);
    const issueBody = encodeURIComponent(`
## Error Description
The page could not be found or failed to load.

## Error Information
\`\`\`json
${JSON.stringify(errorInfo, null, 2)}
\`\`\`

## Steps to Reproduce
1. Visit the page: ${window.location.href}
2. Encounter the 404 error.

## Expected Behavior
The page should load correctly.

## Actual Behavior
A 404 error page is displayed.
    `);

    // IMPORTANT: Replace 'your-github-username' with your actual GitHub username or organization name.
    const githubUrl = `https://github.com/your-github-username/PromptMate/issues/new?title=${issueTitle}&body=${issueBody}`;
    window.open(githubUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-24 w-24 text-muted-foreground" />
          </div>
          <CardTitle className="text-4xl font-bold text-muted-foreground">
            404
          </CardTitle>
          <CardDescription className="text-lg">
            Page Not Found
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-muted-foreground">
            <p>The page you are looking for does not exist or has been moved.</p>
            {error && (
              <div className="mt-4 p-3 bg-muted rounded-lg text-left">
                <p className="text-sm font-medium">Error Details:</p>
                <p className="text-xs mt-1 font-mono break-all">{error}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleGoHome} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            <Button onClick={handleReload} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleReportIssue}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <Bug className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>If you believe this is an error, please report the issue.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
export { NotFoundPage };