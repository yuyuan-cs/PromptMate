import React from 'react';
import { BaseNode } from './BaseNode';
import { CanvasNode } from '@/types/canvas';

interface ConditionNodeProps {
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

export function ConditionNode(props: ConditionNodeProps) {
  // Ensure condition nodes have the correct ports
  const conditionNode: CanvasNode = {
    ...props.node,
    nodeType: 'condition',
    ports: {
      input: [
        {
          id: `${props.node.id}-input`,
          type: 'input' as const,
          dataType: 'any',
          name: 'input',
          label: 'Input',
          position: { x: 0, y: 0 },
          connected: false,
          required: true
        }
      ],
      output: [
        {
          id: `${props.node.id}-true`,
          type: 'output' as const,
          dataType: 'any',
          name: 'true',
          label: 'True',
          position: { x: 0, y: 0 },
          connected: false,
          required: false
        },
        {
          id: `${props.node.id}-false`,
          type: 'output' as const,
          dataType: 'any',
          name: 'false',
          label: 'False',
          position: { x: 0, y: 0 },
          connected: false,
          required: false
        }
      ]
    }
  };

  return <BaseNode {...props} node={conditionNode} />;
}
