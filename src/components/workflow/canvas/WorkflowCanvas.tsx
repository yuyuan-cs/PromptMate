import React, { useState, useCallback } from 'react';
import { CanvasContainer } from './CanvasContainer';
import { CanvasBackground } from './CanvasBackground';
import { NodeFactory } from './nodes/NodeFactory';
import { Connection } from './connections/Connection';
import { CanvasToolbar } from './toolbar/CanvasToolbar';
import { PropertyPanel } from './panels/PropertyPanel';
import { NodeConfigDialog } from './dialogs/NodeConfigDialog';
import { useWorkflowCanvas } from '@/hooks/useWorkflowCanvas';
import { Workflow } from '@/types/workflow';
import { CanvasNode, NodeType, CanvasPosition } from '@/types/canvas';
import { generateId } from '@/lib/utils';

interface WorkflowCanvasProps {
  workflow: Workflow;
  className?: string;
  onSave?: () => void;
  onLoad?: () => void;
  onExport?: () => void;
}

export function WorkflowCanvas({ workflow, className, onSave, onLoad, onExport }: WorkflowCanvasProps) {
  const {
    canvasState,
    selectNode,
    selectConnection,
    startDrag,
    updateDrag,
    endDrag,
    createNode,
    updateNode,
    deleteSelectedNodes,
    createConnection,
    updateConnection,
    deleteConnection,
    clearSelection,
    screenToCanvas
  } = useWorkflowCanvas();

  const [nodeConfigDialog, setNodeConfigDialog] = useState<{
    open: boolean;
    nodeId: string | null;
  }>({ open: false, nodeId: null });

  const [connectionState, setConnectionState] = useState<{
    isConnecting: boolean;
    sourceNodeId: string | null;
    sourcePortId: string | null;
    sourcePortType: 'input' | 'output' | null;
  }>({ isConnecting: false, sourceNodeId: null, sourcePortId: null, sourcePortType: null });

  const handleAddNode = useCallback((nodeType: NodeType) => {
    // Add node at center of current view
    const centerPosition: CanvasPosition = screenToCanvas({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
    
    createNode(nodeType, centerPosition);
  }, [createNode, screenToCanvas]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    const node = canvasState.nodes.find(n => n.id === nodeId);
    if (node) {
      setNodeConfigDialog({ open: true, nodeId });
    }
  }, [canvasState.nodes]);

  const handleNodeConfigClick = useCallback((nodeId: string) => {
    const node = canvasState.nodes.find(n => n.id === nodeId);
    if (node) {
      setNodeConfigDialog({ open: true, nodeId });
    }
  }, [canvasState.nodes]);

  // Wrapper functions to match NodeFactory expected signatures
  const handleNodeDragStart = useCallback((nodeId: string, startPosition: { x: number; y: number }) => {
    startDrag('node', startPosition, nodeId);
  }, [startDrag]);

  const handleNodeDrag = useCallback((nodeId: string, newPosition: { x: number; y: number }) => {
    // Use screen coordinates directly for proper mouse tracking
    updateDrag(newPosition);
  }, [updateDrag]);

  const handleNodeDragEnd = useCallback((nodeId: string) => {
    endDrag();
  }, [endDrag]);

  const handleNodeConfigSave = (nodeId: string, config: any) => {
    updateNode(nodeId, config);
    setNodeConfigDialog({ open: false, nodeId: null });
  };

  const handleConnectionStart = (nodeId: string, portId: string, portType: 'input' | 'output') => {
    setConnectionState({
      isConnecting: true,
      sourceNodeId: nodeId,
      sourcePortId: portId,
      sourcePortType: portType
    });
  };

  const handleConnectionEnd = (nodeId: string, portId: string, portType: 'input' | 'output') => {
    if (connectionState.isConnecting && 
        connectionState.sourceNodeId && 
        connectionState.sourcePortId &&
        connectionState.sourcePortType !== portType) {
      
      const sourceNodeId = connectionState.sourcePortType === 'output' ? connectionState.sourceNodeId : nodeId;
      const targetNodeId = connectionState.sourcePortType === 'output' ? nodeId : connectionState.sourceNodeId;
      const sourcePortId = connectionState.sourcePortType === 'output' ? connectionState.sourcePortId : portId;
      const targetPortId = connectionState.sourcePortType === 'output' ? portId : connectionState.sourcePortId;
      
      createConnection(
        sourceNodeId,
        targetNodeId,
        sourcePortId,
        targetPortId
      );
    }
    
    setConnectionState({
      isConnecting: false,
      sourceNodeId: null,
      sourcePortId: null,
      sourcePortType: null
    });
  };

  const selectedNodes = canvasState.nodes.filter(node => 
    canvasState.viewState.selectedNodes.includes(node.id)
  );
  
  const selectedConnections = canvasState.connections.filter(conn => 
    canvasState.viewState.selectedConnections.includes(conn.id)
  );

  // Connected ports helper for a node
  const getConnectedPorts = useCallback((nodeId: string) => {
    const ports = new Set<string>();
    for (const conn of canvasState.connections) {
      if (conn.sourceNodeId === nodeId) ports.add(conn.sourcePortId);
      if (conn.targetNodeId === nodeId) ports.add(conn.targetPortId);
    }
    return ports;
  }, [canvasState.connections]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <CanvasToolbar
        onSave={() => onSave?.()}
        onLoad={() => console.log('Load workflow')}
        onExport={() => console.log('Export workflow')}
        onCreateNode={handleAddNode}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          <CanvasContainer>
            {/* Render connections */}
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {canvasState.connections.map(connection => {
                const sourceNode = canvasState.nodes.find(n => n.id === connection.sourceNodeId);
                const targetNode = canvasState.nodes.find(n => n.id === connection.targetNodeId);
                
                if (!sourceNode || !targetNode) return null;
                
                return (
                  <Connection
                    key={connection.id}
                    connection={connection}
                    sourcePosition={{
                      x: sourceNode.position.x + (sourceNode.size?.width || 200),
                      y: sourceNode.position.y + (sourceNode.size?.height || 120) / 2
                    }}
                    targetPosition={{
                      x: targetNode.position.x,
                      y: targetNode.position.y + (targetNode.size?.height || 120) / 2
                    }}
                    selected={canvasState.viewState.selectedConnections.includes(connection.id)}
                    onSelect={selectConnection}
                    onDelete={() => deleteConnection(connection.id)}
                  />
                );
              })}
            </svg>

            {/* Render nodes */}
            {canvasState.nodes.map(node => (
              <NodeFactory
                key={node.id}
                node={node}
                selected={canvasState.viewState.selectedNodes.includes(node.id)}
                onSelect={selectNode}
                onDragStart={handleNodeDragStart}
                onDrag={handleNodeDrag}
                onDragEnd={handleNodeDragEnd}
                onDoubleClick={handleNodeDoubleClick}
                onConfigClick={handleNodeConfigClick}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
                connectedPorts={getConnectedPorts(node.id)}
              />
            ))}
          </CanvasContainer>
        </div>
        
        {/* Property Panel */}
        <PropertyPanel
          selectedNodes={selectedNodes}
          selectedConnections={selectedConnections}
          onNodeUpdate={updateNode}
          onConnectionUpdate={updateConnection}
          onOpenNodeConfig={(node) => handleNodeConfigClick(node.id)}
        />
      </div>
      
      {/* Node Configuration Dialog */}
      <NodeConfigDialog
        open={nodeConfigDialog.open}
        onOpenChange={(open) => setNodeConfigDialog(prev => ({ ...prev, open }))}
        node={nodeConfigDialog.nodeId ? canvasState.nodes.find(n => n.id === nodeConfigDialog.nodeId) : undefined}
        onSave={(nodeData) => {
          if (nodeConfigDialog.nodeId) {
            updateNode(nodeConfigDialog.nodeId, nodeData);
            setNodeConfigDialog({ open: false, nodeId: null });
          }
        }}
      />
    </div>
  );
}
