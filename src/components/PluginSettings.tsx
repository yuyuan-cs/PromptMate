import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlugins } from '@/hooks/usePlugins';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/ui/icons';

export function PluginSettings() {
  const { plugins, loadedPlugins, loadPlugin, unloadPlugin, isPluginLoaded } = usePlugins();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    setLoading(pluginId);
    
    try {
      let success = false;
      if (enabled) {
        success = await loadPlugin(pluginId);
        if (success) {
          toast({
            title: "插件已启用",
            description: `${pluginId} 插件已成功加载`,
            variant: "success",
          });
        }
      } else {
        success = await unloadPlugin(pluginId);
        if (success) {
          toast({
            title: "插件已禁用",
            description: `${pluginId} 插件已卸载`,
            variant: "success",
          });
        }
      }
      
      if (!success) {
        toast({
          title: "操作失败",
          description: `无法${enabled ? '启用' : '禁用'}插件 ${pluginId}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Plugin toggle error:', error);
      toast({
        title: "操作失败",
        description: `插件操作时发生错误: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getPluginIcon = (pluginId: string) => {
    switch (pluginId) {
      case 'workflow':
        return <Icons.workflow className="h-5 w-5" />;
      default:
        return <Icons.puzzle className="h-5 w-5" />;
    }
  };

  const getPluginSize = (pluginId: string) => {
    // 估算的插件大小
    switch (pluginId) {
      case 'workflow':
        return '~15MB'; // ReactFlow + 工作流组件
      default:
        return '未知';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.puzzle className="h-5 w-5" />
            插件管理
          </CardTitle>
          <CardDescription>
            管理可选功能插件，禁用不需要的插件可以减少软件包大小和内存占用
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plugins.map((plugin) => {
            const loaded = isPluginLoaded(plugin.id);
            const isLoading = loading === plugin.id;
            
            return (
              <div key={plugin.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getPluginIcon(plugin.id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{plugin.name}</h3>
                      <Badge variant={loaded ? "default" : "secondary"}>
                        v{plugin.version}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getPluginSize(plugin.id)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {plugin.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={loaded ? "success" : "secondary"} className="text-xs">
                        {loaded ? "已启用" : "已禁用"}
                      </Badge>
                      {plugin.dependencies && plugin.dependencies.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          依赖: {plugin.dependencies.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading && (
                    <Icons.loader className="h-4 w-4 animate-spin" />
                  )}
                  <Switch
                    checked={loaded}
                    onCheckedChange={(checked) => handleTogglePlugin(plugin.id, checked)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            );
          })}
          
          {plugins.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Icons.puzzle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>暂无可用插件</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.info className="h-5 w-5" />
            插件说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Icons.workflow className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>工作流插件</strong>: 提供高级工作流自动化和可视化流程构建器功能。
              包含 ReactFlow 图形库，如果不使用工作流功能建议禁用以减少软件包大小。
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Icons.lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>提示</strong>: 禁用插件后需要重启应用才能完全释放内存。
              插件设置会自动保存，下次启动时会记住您的选择。
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
