import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Clock, 
  Database, 
  Merge,
  Download,
  Upload
} from 'lucide-react';
import { SyncConflict } from '@/hooks/useDataSync';
import { cn } from '@/lib/utils';

interface SyncConflictDialogProps {
  conflict: SyncConflict | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (resolution: 'local' | 'remote' | 'merge') => Promise<void>;
}

export const SyncConflictDialog: React.FC<SyncConflictDialogProps> = ({
  conflict,
  open,
  onOpenChange,
  onResolve
}) => {
  const [resolving, setResolving] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<'local' | 'remote' | 'merge' | null>(null);

  if (!conflict) return null;

  const handleResolve = async (resolution: 'local' | 'remote' | 'merge') => {
    try {
      setResolving(true);
      setSelectedResolution(resolution);
      await onResolve(resolution);
      onOpenChange(false);
    } catch (error) {
      console.error('解决冲突失败:', error);
    } finally {
      setResolving(false);
      setSelectedResolution(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDataStats = (data: any) => {
    return {
      prompts: data.prompts?.length || 0,
      categories: data.categories?.length || 0,
      lastModified: formatTimestamp(data.lastModified)
    };
  };

  const localStats = getDataStats(conflict.localData);
  const remoteStats = getDataStats(conflict.remoteData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            数据同步冲突
          </DialogTitle>
          <DialogDescription>
            检测到本地数据与远程数据存在冲突，请选择如何解决：
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 冲突概览 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="font-medium">本地数据</span>
                <Badge variant="outline">当前</Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>提示词: {localStats.prompts} 个</div>
                <div>分类: {localStats.categories} 个</div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {localStats.lastModified}
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-green-500" />
                <span className="font-medium">远程数据</span>
                <Badge variant="outline">同步</Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>提示词: {remoteStats.prompts} 个</div>
                <div>分类: {remoteStats.categories} 个</div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {remoteStats.lastModified}
                </div>
              </div>
            </div>
          </div>

          {/* 详细对比 */}
          <Tabs defaultValue="prompts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prompts">提示词对比</TabsTrigger>
              <TabsTrigger value="categories">分类对比</TabsTrigger>
              <TabsTrigger value="settings">设置对比</TabsTrigger>
            </TabsList>

            <TabsContent value="prompts" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">本地提示词 ({localStats.prompts})</h4>
                  <ScrollArea className="h-48 border rounded p-2">
                    <div className="space-y-1">
                      {conflict.localData.prompts.map((prompt) => (
                        <div key={prompt.id} className="text-sm p-2 bg-muted/50 rounded">
                          <div className="font-medium">{prompt.title}</div>
                          <div className="text-xs text-muted-foreground">
                            更新: {formatTimestamp(prompt.updatedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h4 className="font-medium mb-2">远程提示词 ({remoteStats.prompts})</h4>
                  <ScrollArea className="h-48 border rounded p-2">
                    <div className="space-y-1">
                      {conflict.remoteData.prompts.map((prompt) => (
                        <div key={prompt.id} className="text-sm p-2 bg-muted/50 rounded">
                          <div className="font-medium">{prompt.title}</div>
                          <div className="text-xs text-muted-foreground">
                            更新: {formatTimestamp(prompt.updatedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">本地分类 ({localStats.categories})</h4>
                  <ScrollArea className="h-48 border rounded p-2">
                    <div className="space-y-1">
                      {conflict.localData.categories.map((category) => (
                        <div key={category.id} className="text-sm p-2 bg-muted/50 rounded">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {category.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h4 className="font-medium mb-2">远程分类 ({remoteStats.categories})</h4>
                  <ScrollArea className="h-48 border rounded p-2">
                    <div className="space-y-1">
                      {conflict.remoteData.categories.map((category) => (
                        <div key={category.id} className="text-sm p-2 bg-muted/50 rounded">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {category.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">本地设置</h4>
                  <ScrollArea className="h-48 border rounded p-2">
                    <pre className="text-xs">
                      {JSON.stringify(conflict.localData.settings, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>

                <div>
                  <h4 className="font-medium mb-2">远程设置</h4>
                  <ScrollArea className="h-48 border rounded p-2">
                    <pre className="text-xs">
                      {JSON.stringify(conflict.remoteData.settings, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            选择解决方案：
          </div>
          
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => handleResolve('local')}
              disabled={resolving}
              className={cn(
                "flex-1",
                selectedResolution === 'local' && "bg-blue-50 border-blue-200"
              )}
            >
              <Upload className="h-4 w-4 mr-2" />
              {resolving && selectedResolution === 'local' ? '处理中...' : '使用本地数据'}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleResolve('remote')}
              disabled={resolving}
              className={cn(
                "flex-1",
                selectedResolution === 'remote' && "bg-green-50 border-green-200"
              )}
            >
              <Download className="h-4 w-4 mr-2" />
              {resolving && selectedResolution === 'remote' ? '处理中...' : '使用远程数据'}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleResolve('merge')}
              disabled={resolving}
              className={cn(
                "flex-1",
                selectedResolution === 'merge' && "bg-purple-50 border-purple-200"
              )}
            >
              <Merge className="h-4 w-4 mr-2" />
              {resolving && selectedResolution === 'merge' ? '处理中...' : '智能合并'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <div>• 本地数据：保留当前本地的所有数据</div>
            <div>• 远程数据：使用同步过来的数据覆盖本地</div>
            <div>• 智能合并：自动合并两边的数据，保留最新版本</div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
