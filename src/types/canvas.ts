// Canvas-specific types extending the existing workflow types
import { WorkflowStep, WorkflowVariable } from './workflow';

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasViewState {
  zoom: number;
  pan: CanvasPosition;
  selectedNodes: string[];
  selectedConnections: string[];
}

export interface CanvasPort {
  id: string;
  type: 'input' | 'output';
  dataType: 'string' | 'number' | 'boolean' | 'text' | 'file' | 'any' | 'object' | 'array';
  name: string;
  label: string;
  position: CanvasPosition;
  connected: boolean;
  required?: boolean;
}

export interface VisualWorkflowStep extends WorkflowStep {
  // Canvas position information
  position: CanvasPosition;
  // Node size
  size: CanvasSize;
  // Node type for visual representation
  nodeType: 'start' | 'prompt' | 'condition' | 'end' | 'variable' | 'output';
  // Port configuration
  ports: {
    input: CanvasPort[];
    output: CanvasPort[];
  };
  // Visual styling
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    borderRadius?: number;
  };
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  label?: string;
  type?: 'always' | 'success' | 'failure' | 'conditional';
  condition?: {
    type: 'always' | 'success' | 'failure' | 'condition';
    value?: string;
  };
  style?: {
    strokeColor?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  // Path points for curved connections
  path?: CanvasPosition[];
}

export interface CanvasNode extends VisualWorkflowStep {
  // Additional canvas-specific properties
  selected: boolean;
  dragging: boolean;
  resizable: boolean;
  // UI properties
  label?: string;
  description?: string;
  // Node-specific data
  data?: {
    promptContent?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    variables?: Array<{
      id: string;
      name: string;
      type: 'input' | 'output';
      dataType: 'string' | 'number' | 'boolean' | 'array' | 'object';
      required: boolean;
      defaultValue?: any;
      description?: string;
    }>;
    outputFormat?: string;
    retryCount?: number;
    timeout?: number;
    condition?: string;
    [key: string]: any;
  };
}

export interface DragState {
  isDragging: boolean;
  dragType: 'node' | 'canvas' | 'connection' | null;
  startPosition: CanvasPosition;
  currentPosition: CanvasPosition;
  nodeId?: string;
  targetNodeId?: string;
  sourcePortId?: string;
}

export interface CanvasState {
  nodes: CanvasNode[];
  connections: WorkflowConnection[];
  viewState: CanvasViewState;
  dragState: DragState;
  clipboard: {
    nodes: CanvasNode[];
    connections: WorkflowConnection[];
  };
}

export type NodeType = 'start' | 'prompt' | 'condition' | 'end' | 'variable' | 'output';

export interface NodeTemplate {
  type: NodeType;
  label: string;
  icon: string;
  defaultSize: CanvasSize;
  defaultPorts: {
    input: Omit<CanvasPort, 'id' | 'position' | 'connected'>[];
    output: Omit<CanvasPort, 'id' | 'position' | 'connected'>[];
  };
  style: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  };
}
