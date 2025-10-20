import { Suspense, lazy } from 'react';
import { usePlugins } from '@/hooks/usePlugins';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

// 懒加载工作流视图
const LazyWorkflowView = lazy(() => 
  import('../views/WorkflowView').then(module => ({ default: module.default }))
);

interface ConditionalWorkflowViewProps {
  // 可以传递给工作流视图的props
  [key: string]: any;
}

export function ConditionalWorkflowView(props: ConditionalWorkflowViewProps) {
  const { isPluginLoaded, loadPlugin } = usePlugins();
  const workflowLoaded = isPluginLoaded('workflow');

  if (!workflowLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Icons.workflow className="h-6 w-6" />
            </div>
            <CardTitle>工作流功能未启用</CardTitle>
            <CardDescription>
              工作流功能作为可选插件提供，需要手动启用才能使用
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• 提供可视化流程构建器</p>
              <p>• 支持多步骤自动化执行</p>
              <p>• 包含约15MB的额外依赖</p>
            </div>
            <Button 
              onClick={() => loadPlugin('workflow')} 
              className="w-full"
            >
              <Icons.download className="mr-2 h-4 w-4" />
              启用工作流插件
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Icons.loader className="h-5 w-5 animate-spin" />
            <span>正在加载工作流...</span>
          </div>
        </div>
      }
    >
      <LazyWorkflowView {...props} />
    </Suspense>
  );
}
