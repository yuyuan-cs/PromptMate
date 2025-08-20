import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useWorkflowCanvas } from '@/hooks/useWorkflowCanvas';
import { NodeType } from '@/types/canvas';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CanvasToolbarProps {
  onCreateNode?: (nodeType: NodeType) => void;
  onSave?: () => void;
  onLoad?: () => void;
  onExport?: () => void;
}

export function CanvasToolbar({ onCreateNode, onSave, onLoad, onExport }: CanvasToolbarProps) {
  const {
    canvasState,
    setZoom,
    setPan,
    resetView,
    clearSelection,
    copySelectedNodes,
    pasteNodes
  } = useWorkflowCanvas();

  const nodeTypes: Array<{ type: NodeType; label: string; icon: keyof typeof Icons }> = [
    { type: 'start', label: '开始', icon: 'play' },
    { type: 'prompt', label: '提示词', icon: 'fileText' },
    { type: 'condition', label: '条件', icon: 'workflow' },
    { type: 'variable', label: '变量', icon: 'circle' },
    { type: 'output', label: '输出', icon: 'download' },
    { type: 'end', label: '结束', icon: 'stop' }
  ];

  const handleZoomIn = () => {
    setZoom(canvasState.viewState.zoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoom(canvasState.viewState.zoom - 0.1);
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleFitToScreen = () => {
    resetView();
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-background border-b">
      <TooltipProvider>
        {/* File operations */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onSave}>
                <Icons.save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>保存工作流</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onLoad}>
                <Icons.folder className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>加载工作流</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onExport}>
                <Icons.download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>导出工作流</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Node creation */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">节点:</span>
          {nodeTypes.map(({ type, label, icon }) => {
            const IconComponent = Icons[icon];
            return (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCreateNode?.(type)}
                    className="flex items-center gap-1"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>添加{label}节点</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Edit operations */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copySelectedNodes}
                disabled={canvasState.viewState.selectedNodes.length === 0}
              >
                <Icons.copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>复制选中节点 (Ctrl+C)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => pasteNodes()}
                disabled={canvasState.clipboard.nodes.length === 0}
              >
                <Icons.copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>粘贴节点 (Ctrl+V)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSelection}
                disabled={canvasState.viewState.selectedNodes.length === 0}
              >
                <Icons.x className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>清除选择 (Esc)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* View controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <Icons.zoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>缩小 (Ctrl+-)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleResetZoom}>
                <Badge variant="outline" className="text-xs px-2">
                  {Math.round(canvasState.viewState.zoom * 100)}%
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>重置缩放 (Ctrl+0)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <Icons.zoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>放大 (Ctrl++)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleFitToScreen}>
                <Icons.layout className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>适应屏幕</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Status info */}
        <div className="flex items-center gap-4 ml-auto text-sm text-muted-foreground">
          <span>节点: {canvasState.nodes.length}</span>
          <span>连接: {canvasState.connections.length}</span>
          {canvasState.viewState.selectedNodes.length > 0 && (
            <span>已选择: {canvasState.viewState.selectedNodes.length}</span>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
