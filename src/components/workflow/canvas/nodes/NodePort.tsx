import React from 'react';
import { cn } from '@/lib/utils';
import { CanvasPort } from '@/types/canvas';

interface NodePortProps {
  port: CanvasPort;
  nodeId: string;
  isConnected?: boolean;
  onConnectionStart?: (nodeId: string, portId: string, portType: 'input' | 'output') => void;
  onConnectionEnd?: (nodeId: string, portId: string, portType: 'input' | 'output') => void;
  className?: string;
}

export function NodePort({ 
  port, 
  nodeId, 
  isConnected = false, 
  onConnectionStart, 
  onConnectionEnd,
  className 
}: NodePortProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConnectionStart?.(nodeId, port.id, port.type);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConnectionEnd?.(nodeId, port.id, port.type);
  };

  const getPortColor = () => {
    switch (port.dataType) {
      case 'string':
        return 'bg-blue-500 border-blue-600';
      case 'number':
        return 'bg-green-500 border-green-600';
      case 'boolean':
        return 'bg-yellow-500 border-yellow-600';
      case 'object':
        return 'bg-purple-500 border-purple-600';
      case 'array':
        return 'bg-orange-500 border-orange-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2",
        port.type === 'output' && "flex-row-reverse",
        className
      )}
    >
      {/* Port circle */}
      <div
        className={cn(
          "w-3 h-3 rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-125",
          getPortColor(),
          isConnected && "ring-2 ring-white ring-opacity-50",
          "hover:shadow-lg"
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        title={`${port.name} (${port.dataType})`}
      />
      
      {/* Port label */}
      <span 
        className={cn(
          "text-xs text-muted-foreground group-hover:text-foreground transition-colors",
          port.type === 'output' && "text-right"
        )}
      >
        {port.name}
      </span>
      
      {/* Required indicator */}
      {port.required && (
        <span className="text-xs text-red-500 ml-1">*</span>
      )}
    </div>
  );
}
