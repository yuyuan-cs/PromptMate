import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CanvasNode } from '@/types/canvas';
import { Icons } from '@/components/ui/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NodePort } from './NodePort';
import { cn } from '@/lib/utils';

interface BaseNodeProps {
  node: CanvasNode;
  selected: boolean;
  onSelect: (nodeId: string, multi?: boolean) => void;
  onDragStart?: (nodeId: string, startPosition: { x: number; y: number }) => void;
  onDrag?: (nodeId: string, newPosition: { x: number; y: number }) => void;
  onDragEnd?: (nodeId: string) => void;
  onResize?: (nodeId: string, newSize: { width: number; height: number }) => void;
  onDoubleClick: (nodeId: string) => void;
  onConfigClick?: (nodeId: string) => void;
  onConnectionStart?: (nodeId: string, portId: string, portType: 'input' | 'output') => void;
  onConnectionEnd?: (nodeId: string, portId: string, portType: 'input' | 'output') => void;
  connectedPorts?: Set<string>;
}

export function BaseNode({ 
  node, 
  selected, 
  onSelect, 
  onDragStart, 
  onDrag, 
  onDragEnd, 
  onResize,
  onDoubleClick, 
  onConfigClick,
  onConnectionStart,
  onConnectionEnd,
  connectedPorts = new Set() 
}: BaseNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id, e.ctrlKey || e.metaKey);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    if (e.altKey || e.shiftKey) return; // Don't drag when panning
    
    e.preventDefault();
    e.stopPropagation();
    
    // Store initial mouse position and node position for relative dragging
    dragOffsetRef.current = {
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    };
    
    setIsDragging(true);
    onDragStart?.(node.id, { x: e.clientX, y: e.clientY });
  }, [node.id, node.position.x, node.position.y, onDragStart]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(node.id);
  };

  useEffect(() => {
    let lastUpdateTime = 0;
    const THROTTLE_MS = 8; // ~120fps for ultra-smooth dragging
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragOffsetRef.current) return;
      
      const now = performance.now();
      if (now - lastUpdateTime < THROTTLE_MS) return;
      
      lastUpdateTime = now;
      
      const newPosition = {
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y
      };
      
      onDrag?.(node.id, newPosition);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd?.(node.id);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, onDrag, node.id, onDragEnd]);

  const getNodeIcon = () => {
    switch (node.nodeType) {
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

  const getNodeVariables = () => {
    if (node.nodeType === 'prompt' && node.data?.variables) {
      return node.data.variables;
    }
    return [];
  };

  const hasConfiguration = () => {
    return node.nodeType === 'prompt' || node.nodeType === 'condition';
  };

  const getNodeColor = () => {
    switch (node.nodeType) {
      case 'start':
        return 'border-green-500 bg-green-50 text-green-700';
      case 'prompt':
        return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'condition':
        return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'variable':
        return 'border-purple-500 bg-purple-50 text-purple-700';
      case 'output':
        return 'border-indigo-500 bg-indigo-50 text-indigo-700';
      case 'end':
        return 'border-red-500 bg-red-50 text-red-700';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  const getNodeTypeStyles = () => {
    switch (node.nodeType) {
      case 'start':
        return 'bg-green-50';
      case 'prompt':
        return 'bg-blue-50';
      case 'condition':
        return 'bg-yellow-50';
      case 'variable':
        return 'bg-purple-50';
      case 'output':
        return 'bg-indigo-50';
      case 'end':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  const IconComponent = getNodeIcon();

  // Get input and output ports
  const inputPorts = node.ports?.input || [];
  const outputPorts = node.ports?.output || [];

  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute bg-white border-2 rounded-lg shadow-lg cursor-pointer select-none",
        selected && "ring-2 ring-blue-500 ring-opacity-50",
        isDragging && "shadow-2xl z-50",
        getNodeColor()
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        minWidth: 200,
        minHeight: 120,
        width: node.size?.width || 'auto',
        height: node.size?.height || 'auto',
        willChange: isDragging ? 'transform' : 'auto',
        transform: isDragging ? 'translateZ(0)' : 'none'
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Input ports */}
      {inputPorts.length > 0 && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 space-y-2">
          {inputPorts.map(port => (
            <NodePort
              key={port.id}
              port={port}
              nodeId={node.id}
              isConnected={connectedPorts.has(port.id)}
              onConnectionStart={onConnectionStart}
              onConnectionEnd={onConnectionEnd}
            />
          ))}
        </div>
      )}

      {/* Output ports */}
      {outputPorts.length > 0 && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 space-y-2">
          {outputPorts.map(port => (
            <NodePort
              key={port.id}
              port={port}
              nodeId={node.id}
              isConnected={connectedPorts.has(port.id)}
              onConnectionStart={onConnectionStart}
              onConnectionEnd={onConnectionEnd}
            />
          ))}
        </div>
      )}

    {/* Node content */}
    <div className="p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconComponent className="h-4 w-4" />
          <span className="text-sm font-medium truncate">{node.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {node.nodeType}
          </Badge>
          {onConfigClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onConfigClick(node.id);
              }}
            >
              <Icons.settings className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 text-xs text-muted-foreground overflow-auto">
        <div className="whitespace-pre-wrap break-words">
          {node.data?.description || '点击配置节点...'}
        </div>

        {/* Variables display */}
        {node.data?.variables && node.data.variables.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {node.data.variables.slice(0, 3).map((variable) => (
              <Badge key={variable.name} variant="outline" className="text-xs px-1 py-0">
                <Icons.variable className="h-2 w-2 mr-1" />
                {variable.name}
              </Badge>
            ))}
            {node.data.variables.length > 3 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{node.data.variables.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Prompt preview for prompt nodes */}
        {node.nodeType === 'prompt' && node.data?.promptContent && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mb-2">
            <div className="line-clamp-2">
              {node.data.promptContent.substring(0, 100)}
              {node.data.promptContent.length > 100 && '...'}
            </div>
          </div>
        )}

        {/* Model info for prompt nodes */}
        {node.nodeType === 'prompt' && node.data?.model && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icons.cpu className="h-3 w-3" />
            <span>{node.data.model}</span>
            {node.data.temperature !== undefined && (
              <span className="ml-2">T: {node.data.temperature}</span>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
