import React from 'react';
import { BaseNode } from './BaseNode';
import { ConditionNode } from './ConditionNode';
import { VariableNode } from './VariableNode';
import { OutputNode } from './OutputNode';
import { CanvasNode } from '@/types/canvas';

interface NodeFactoryProps {
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

export function NodeFactory(props: NodeFactoryProps) {
  const { node } = props;

  switch (node.nodeType) {
    case 'condition':
      return <ConditionNode {...props} />;
    case 'variable':
      return <VariableNode {...props} />;
    case 'output':
      return <OutputNode {...props} />;
    case 'start':
    case 'prompt':
    case 'end':
    default:
      return <BaseNode {...props} />;
  }
}
