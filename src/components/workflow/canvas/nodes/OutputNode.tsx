import React from 'react';
import { BaseNode } from './BaseNode';
import { CanvasNode } from '@/types/canvas';

interface OutputNodeProps {
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

export function OutputNode(props: OutputNodeProps) {
  // Ensure output nodes have the correct ports
  const outputNode: CanvasNode = {
    ...props.node,
    nodeType: 'output',
    ports: {
      input: [
        {
          id: `${props.node.id}-input`,
          type: 'input' as const,
          dataType: 'any',
          name: 'result',
          label: 'Result',
          position: { x: 0, y: 0 },
          connected: false,
          required: true
        } 
      ],
      output: []
    }
  };

  return <BaseNode {...props} node={outputNode} />;
}
