import React from 'react';
import { WorkflowConnection, CanvasPosition } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface ConnectionProps {
  connection: WorkflowConnection;
  sourcePosition: CanvasPosition;
  targetPosition: CanvasPosition;
  selected?: boolean;
  onSelect?: (connectionId: string, multi?: boolean) => void;
  onDelete?: () => void;
}

export function Connection({ 
  connection,
  sourcePosition,
  targetPosition,
  selected = false,
  onSelect,
  onDelete 
}: ConnectionProps) {
  // Calculate control points for curved connection
  const calculatePath = () => {
    const dx = targetPosition.x - sourcePosition.x;
    const dy = targetPosition.y - sourcePosition.y;
    
    // Control point offset based on distance
    const controlOffset = Math.max(50, Math.abs(dx) * 0.3);
    
    const controlPoint1: CanvasPosition = {
      x: sourcePosition.x + controlOffset,
      y: sourcePosition.y
    };
    
    const controlPoint2: CanvasPosition = {
      x: targetPosition.x - controlOffset,
      y: targetPosition.y
    };
    
    return `M ${sourcePosition.x} ${sourcePosition.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${targetPosition.x} ${targetPosition.y}`;
  };

  const getConnectionColor = () => {
    if (selected) return 'stroke-primary';
    
    switch (connection.condition?.type) {
      case 'success':
        return 'stroke-green-500';
      case 'failure':
        return 'stroke-red-500';
      case 'condition':
        return 'stroke-yellow-500';
      default:
        return 'stroke-muted-foreground';
    }
  };

  const getStrokeWidth = () => {
    return selected ? 3 : 2;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(connection.id, e.ctrlKey || e.metaKey);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open connection configuration dialog
    console.log('Double clicked connection:', connection.id);
  };

  // Calculate midpoint for condition label
  const midPoint: CanvasPosition = {
    x: (sourcePosition.x + targetPosition.x) / 2,
    y: (sourcePosition.y + targetPosition.y) / 2
  };

  return (
    <g>
      {/* Main connection path */}
      <path
        d={calculatePath()}
        fill="none"
        className={cn(
          "transition-all duration-200 cursor-pointer hover:stroke-primary",
          getConnectionColor()
        )}
        strokeWidth={getStrokeWidth()}
        strokeDasharray={connection.style?.strokeDasharray}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      />
      
      {/* Invisible wider path for easier clicking */}
      <path
        d={calculatePath()}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        className="cursor-pointer"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      />
      
      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            className={getConnectionColor()}
            fill="currentColor"
          />
        </marker>
      </defs>
      
      <path
        d={calculatePath()}
        fill="none"
        className={getConnectionColor()}
        strokeWidth={getStrokeWidth()}
        markerEnd={`url(#arrowhead-${connection.id})`}
        pointerEvents="none"
      />
      
      {/* Condition label */}
      {connection.condition?.type !== 'always' && (
        <g>
          <rect
            x={midPoint.x - 20}
            y={midPoint.y - 8}
            width="40"
            height="16"
            rx="8"
            className="fill-background stroke-current stroke-1"
          />
          <text
            x={midPoint.x}
            y={midPoint.y + 1}
            textAnchor="middle"
            className="text-xs fill-current pointer-events-none"
          >
            {connection.condition?.type === 'success' ? '✓' : 
             connection.condition?.type === 'failure' ? '✗' : '?'}
          </text>
        </g>
      )}
      
      {/* Delete button when selected */}
      {selected && (
        <g>
          <circle
            cx={midPoint.x + 25}
            cy={midPoint.y - 15}
            r="8"
            className="fill-destructive stroke-background stroke-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          />
          <text
            x={midPoint.x + 25}
            y={midPoint.y - 11}
            textAnchor="middle"
            className="text-xs fill-destructive-foreground pointer-events-none"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
}
