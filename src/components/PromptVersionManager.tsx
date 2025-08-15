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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  History, 
  Clock, 
  FileText, 
  RotateCcw, 
  Plus,
  Eye,
  Edit3
} from 'lucide-react';
import { Prompt, PromptVersion } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PromptVersionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onRestoreVersion: (version: PromptVersion) => void;
  onCreateVersion: (changeNotes?: string) => void;
}

export const PromptVersionManager: React.FC<PromptVersionManagerProps> = ({
  isOpen,
  onClose,
  prompt,
  onRestoreVersion,
  onCreateVersion,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [changeNotes, setChangeNotes] = useState('');

  if (!prompt) return null;

  const versions = prompt.versions || [];
  const currentVersion = {
    id: 'current',
    version: prompt.version,
    title: prompt.title,
    content: prompt.content,
    description: prompt.description,
    images: prompt.images,
    createdAt: prompt.updatedAt,
    changeNotes: '当前版本'
  };

  const allVersions = [currentVersion, ...versions].sort((a, b) => b.version - a.version);

  const handleRestoreVersion = (version: PromptVersion) => {
    onRestoreVersion(version);
    onClose();
  };

  const handleCreateVersion = () => {
    onCreateVersion(changeNotes.trim() || undefined);
    setChangeNotes('');
    setShowCreateVersion(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <DialogTitle>版本管理 - {prompt.title}</DialogTitle>
          </div>
          <DialogDescription>
            查看和管理提示词的历史版本，可以恢复到任意版本
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* 版本列表 */}
          <div className="w-1/3 border-r pr-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">版本历史</h3>
              <Button
                size="sm"
                onClick={() => setShowCreateVersion(true)}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                创建版本
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {allVersions.map((version) => (
                  <div
                    key={version.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedVersion?.id === version.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={version.id === 'current' ? 'default' : 'secondary'}>
                        v{version.version}
                      </Badge>
                      {version.id === 'current' && (
                        <Badge variant="outline" className="text-xs">
                          当前
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(version.createdAt), {
                        addSuffix: true,
                        locale: zhCN
                      })}
                    </div>
                    
                    {version.changeNotes && (
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {version.changeNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 版本详情 */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedVersion ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">版本 {selectedVersion.version} 详情</h3>
                  {selectedVersion.id !== 'current' && (
                    <Button
                      size="sm"
                      onClick={() => handleRestoreVersion(selectedVersion)}
                      className="h-8"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      恢复此版本
                    </Button>
                  )}
                </div>

                <ScrollArea className="flex-1">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">标题</Label>
                      <div className="mt-1 p-2 bg-muted/50 rounded border text-sm">
                        {selectedVersion.title}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">内容</Label>
                      <div className="mt-1 p-3 bg-muted/50 rounded border text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                        {selectedVersion.content}
                      </div>
                    </div>

                    {selectedVersion.description && (
                      <div>
                        <Label className="text-sm font-medium">描述</Label>
                        <div className="mt-1 p-2 bg-muted/50 rounded border text-sm">
                          {selectedVersion.description}
                        </div>
                      </div>
                    )}

                    {selectedVersion.changeNotes && (
                      <div>
                        <Label className="text-sm font-medium">变更说明</Label>
                        <div className="mt-1 p-2 bg-muted/50 rounded border text-sm">
                          {selectedVersion.changeNotes}
                        </div>
                      </div>
                    )}

                    {selectedVersion.images && selectedVersion.images.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">参考图片</Label>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          {selectedVersion.images.map((image, index) => (
                            <div key={image.id} className="border rounded overflow-hidden">
                              <img
                                src={image.data}
                                alt={image.caption || `图片 ${index + 1}`}
                                className="w-full h-24 object-cover"
                              />
                              {image.caption && (
                                <div className="p-1 text-xs text-muted-foreground">
                                  {image.caption}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>选择一个版本查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 创建版本对话框 */}
        {showCreateVersion && (
          <div className="border-t pt-4 mt-4">
            <Label htmlFor="change-notes" className="text-sm font-medium">
              版本变更说明（可选）
            </Label>
            <Textarea
              id="change-notes"
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="描述这个版本的主要变更..."
              className="mt-2 min-h-[80px]"
            />
            <div className="flex gap-2 mt-3">
              <Button onClick={handleCreateVersion}>
                创建版本
              </Button>
              <Button variant="outline" onClick={() => setShowCreateVersion(false)}>
                取消
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
