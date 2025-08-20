import React from 'react';
import { BaseNode } from './BaseNode';
import { CanvasNode } from '@/types/canvas';

interface VariableNodeProps {
  node: CanvasNode;
  selected: boolean;
  onSelect: (nodeId: string, multi?: boolean) => void;
  onDragStart?: (nodeId: string, startPosition: { x: number; y: number }) => void;
  onDrag?: (nodeId: string, newPosition: { x: number; y: number }) => void;
  onDragEnd?: (nodeId: string) => void;
  onDoubleClick: (nodeId: string) => void;
  onConfigClick?: (nodeId: string) => void;
  onConnectionStart?: (nodeId: string, portId: string, portType: 'input' | 'output') => void;
  onConnectionEnd?: (nodeId: string, portId: string, portType: 'input' | 'output') => void;
  connectedPorts?: Set<string>;
}

export function VariableNode(props: VariableNodeProps) {
  // Ensure variable nodes have the correct ports
  const variableNode: CanvasNode = {
    ...props.node,
    nodeType: 'variable',
    ports: {
      input: [],
      output: [
        {
          id: `${props.node.id}-output`,
          type: 'output' as const,
          dataType: 'any',
          name: 'value',
          label: 'Value',
          position: { x: 0, y: 0 },
          connected: false,
          required: false
        }
      ]
    }
  };

  return <BaseNode {...props} node={variableNode} />;
}
