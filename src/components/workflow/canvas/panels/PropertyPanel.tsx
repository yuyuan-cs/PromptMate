import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/ui/icons';
import { CanvasNode, WorkflowConnection } from '@/types/canvas';

interface PropertyPanelProps {
  selectedNodes: CanvasNode[];
  selectedConnections: WorkflowConnection[];
  onNodeUpdate: (nodeId: string, updates: Partial<CanvasNode>) => void;
  onConnectionUpdate: (connectionId: string, updates: Partial<WorkflowConnection>) => void;
  onOpenNodeConfig: (node: CanvasNode) => void;
}

export function PropertyPanel({
  selectedNodes,
  selectedConnections,
  onNodeUpdate,
  onConnectionUpdate,
  onOpenNodeConfig,
}: PropertyPanelProps) {
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const selectedConnection = selectedConnections.length === 1 ? selectedConnections[0] : null;

  const handleNodeLabelChange = (value: string) => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, { label: value });
    }
  };

  const handleNodeDescriptionChange = (value: string) => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, { description: value });
    }
  };

  const handleConnectionLabelChange = (value: string) => {
    if (selectedConnection) {
      onConnectionUpdate(selectedConnection.id, { label: value });
    }
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'start':
        return Icons.play;
      case 'prompt':
        return Icons.fileText;
      case 'condition':
        return Icons.workflow;
      case 'variable':
        return Icons.circle;
      case 'output':
        return Icons.download;
      case 'end':
        return Icons.stop;
      default:
        return Icons.circle;
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'start':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'prompt':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'condition':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'variable':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'output':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'end':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (selectedNodes.length === 0 && selectedConnections.length === 0) {
    return (
      <div className="w-80 border-l bg-background">
        <div className="p-4">
          <h3 className="font-semibold mb-4">属性面板</h3>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Icons.info className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-center">选择节点或连接线</p>
            <p className="text-sm text-center">查看和编辑属性</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedNodes.length > 1) {
    return (
      <div className="w-80 border-l bg-background">
        <div className="p-4">
          <h3 className="font-semibold mb-4">属性面板</h3>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">多选节点</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                已选择 {selectedNodes.length} 个节点
              </p>
              <div className="space-y-2">
                {selectedNodes.map((node) => {
                  const IconComponent = getNodeTypeIcon(node.nodeType);
                  return (
                    <div key={node.id} className="flex items-center gap-2 p-2 border rounded">
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm">{node.label || node.id}</span>
                      <Badge className={`ml-auto text-xs ${getNodeTypeColor(node.nodeType)}`}>
                        {node.nodeType}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-background">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <h3 className="font-semibold">属性面板</h3>

          {selectedNode && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {React.createElement(getNodeTypeIcon(selectedNode.nodeType), { className: "h-4 w-4" })}
                    节点属性
                  </CardTitle>
                  <Badge className={`text-xs ${getNodeTypeColor(selectedNode.nodeType)}`}>
                    {selectedNode.nodeType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="node-label">标签</Label>
                  <Input
                    id="node-label"
                    value={selectedNode.label || ''}
                    onChange={(e) => handleNodeLabelChange(e.target.value)}
                    placeholder="节点标签"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="node-description">描述</Label>
                  <Textarea
                    id="node-description"
                    value={selectedNode.description || ''}
                    onChange={(e) => handleNodeDescriptionChange(e.target.value)}
                    placeholder="节点描述"
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>位置</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">X</Label>
                      <Input
                        value={Math.round(selectedNode.position.x)}
                        readOnly
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Y</Label>
                      <Input
                        value={Math.round(selectedNode.position.y)}
                        readOnly
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>尺寸</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">宽度</Label>
                      <Input
                        value={selectedNode.size?.width || 200}
                        readOnly
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">高度</Label>
                      <Input
                        value={selectedNode.size?.height || 100}
                        readOnly
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {selectedNode.nodeType === 'prompt' && selectedNode.data && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>提示词配置</Label>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>模型:</span>
                          <span>{selectedNode.data.model || 'gpt-4'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>温度:</span>
                          <span>{selectedNode.data.temperature || 0.7}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>最大令牌:</span>
                          <span>{selectedNode.data.maxTokens || 2000}</span>
                        </div>
                        {selectedNode.data.variables && selectedNode.data.variables.length > 0 && (
                          <div>
                            <span>变量: {selectedNode.data.variables.length} 个</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <Button
                  onClick={() => onOpenNodeConfig(selectedNode)}
                  className="w-full"
                  size="sm"
                >
                  <Icons.settings className="h-4 w-4 mr-2" />
                  详细配置
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedConnection && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icons.workflow className="h-4 w-4" />
                  连接属性
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="connection-label">标签</Label>
                  <Input
                    id="connection-label"
                    value={selectedConnection.label || ''}
                    onChange={(e) => handleConnectionLabelChange(e.target.value)}
                    placeholder="连接标签"
                  />
                </div>

                <div className="space-y-2">
                  <Label>连接信息</Label>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>源节点:</span>
                      <span>{selectedConnection.sourceNodeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>目标节点:</span>
                      <span>{selectedConnection.targetNodeId}</span>
                    </div>
                    {selectedConnection.condition && (
                      <div className="flex justify-between">
                        <span>条件:</span>
                        <span>{selectedConnection.condition.type}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedConnection.type === 'conditional' && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>条件设置</Label>
                      <p className="text-xs text-muted-foreground">
                        点击连接线可以编辑条件表达式
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
