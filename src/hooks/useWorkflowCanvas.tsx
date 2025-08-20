import { useState, useCallback, useRef, useEffect } from 'react';
import { CanvasState, CanvasNode, WorkflowConnection, CanvasPosition, DragState, CanvasViewState, NodeType } from '@/types/canvas';
import { generateId } from '@/lib/utils';

const DEFAULT_VIEW_STATE: CanvasViewState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedNodes: [],
  selectedConnections: []
};

const DEFAULT_DRAG_STATE: DragState = {
  isDragging: false,
  dragType: null,
  startPosition: { x: 0, y: 0 },
  currentPosition: { x: 0, y: 0 },
  nodeId: undefined,
  targetNodeId: undefined,
  sourcePortId: undefined
};

export function useWorkflowCanvas() {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    nodes: [],
    connections: [],
    viewState: DEFAULT_VIEW_STATE,
    dragState: DEFAULT_DRAG_STATE,
    clipboard: { nodes: [], connections: [] }
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Canvas view operations
  const setZoom = useCallback((zoom: number) => {
    setCanvasState(prev => ({
      ...prev,
      viewState: { ...prev.viewState, zoom: Math.max(0.25, Math.min(2, zoom)) }
    }));
  }, []);

  const setPan = useCallback((pan: CanvasPosition) => {
    setCanvasState(prev => ({
      ...prev,
      viewState: { ...prev.viewState, pan }
    }));
  }, []);

  const resetView = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      viewState: DEFAULT_VIEW_STATE
    }));
  }, []);

  // Node operations
  const addNode = useCallback((nodeType: NodeType, position: CanvasPosition) => {
    const newNode: CanvasNode = {
      id: generateId(),
      name: `${nodeType} Node`,
      order: 0,
      inputVariables: [],
      isOptional: false,
      position,
      size: { width: 200, height: 100 },
      nodeType,
      ports: {
        input: [
          {
            id: `${generateId()}-input`,
            type: 'input' as const,
            dataType: 'any',
            name: 'input',
            label: 'Input',
            position: { x: 0, y: 0 },
            connected: false,
            required: false
          }
        ],
        output: nodeType !== 'end' ? [{
          id: generateId(),
          type: 'output' as const,
          dataType: 'any',
          name: 'output',
          label: 'Output',
          position: { x: 200, y: 50 },
          connected: false,
          required: false
        }] : []
      },
      selected: false,
      dragging: false,
      resizable: true
    };

    setCanvasState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));

    return newNode.id;
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<CanvasNode>) => {
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => 
        conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      )
    }));
  }, []);

  const selectNode = useCallback((nodeId: string, multiSelect = false) => {
    setCanvasState(prev => {
      const selectedNodes = multiSelect 
        ? prev.viewState.selectedNodes.includes(nodeId)
          ? prev.viewState.selectedNodes.filter(id => id !== nodeId)
          : [...prev.viewState.selectedNodes, nodeId]
        : [nodeId];

      return {
        ...prev,
        viewState: { ...prev.viewState, selectedNodes },
        nodes: prev.nodes.map(node => ({
          ...node,
          selected: selectedNodes.includes(node.id)
        }))
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      viewState: { ...prev.viewState, selectedNodes: [], selectedConnections: [] },
      nodes: prev.nodes.map(node => ({ ...node, selected: false }))
    }));
  }, []);

  // Connection operations
  const addConnection = useCallback((sourceNodeId: string, targetNodeId: string, sourcePortId?: string, targetPortId?: string) => {
    const newConnection: WorkflowConnection = {
      id: generateId(),
      sourceNodeId,
      sourcePortId: sourcePortId || 'output',
      targetNodeId,
      targetPortId: targetPortId || 'input',
      condition: { type: 'always' }
    };

    setCanvasState(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }));

    return newConnection.id;
  }, []);

  const deleteConnection = useCallback((connectionId: string) => {
    setCanvasState(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId)
    }));
  }, []);

  // Drag operations
  const startDrag = useCallback((dragType: DragState['dragType'], startPosition: CanvasPosition, nodeId?: string) => {
    setCanvasState(prev => ({
      ...prev,
      dragState: {
        isDragging: true,
        dragType,
        startPosition,
        currentPosition: startPosition,
        nodeId: dragType === 'node' ? nodeId : undefined,
        targetNodeId: nodeId,
        sourcePortId: undefined
      }
    }));
  }, []);

  const updateDrag = useCallback((currentPosition: CanvasPosition) => {
    setCanvasState(prev => {
      if (!prev.dragState.isDragging) return prev;

      if (prev.dragState.dragType === 'node' && prev.dragState.nodeId) {
        // Find the dragging node and update only if position changed
        const draggedNode = prev.nodes.find(node => node.id === prev.dragState.nodeId);
        if (!draggedNode || 
            (draggedNode.position.x === currentPosition.x && draggedNode.position.y === currentPosition.y)) {
          return prev;
        }

        // Create new nodes array with updated position
        const updatedNodes = prev.nodes.map(node => {
          if (node.id === prev.dragState.nodeId) {
            return {
              ...node,
              position: {
                x: currentPosition.x,
                y: currentPosition.y
              },
              dragging: true
            };
          }
          return node;
        });

        return {
          ...prev,
          nodes: updatedNodes,
          dragState: {
            ...prev.dragState,
            currentPosition
          }
        };
      }

      return {
        ...prev,
        dragState: {
          ...prev.dragState,
          currentPosition
        }
      };
    });
  }, []);

  const endDrag = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      dragState: DEFAULT_DRAG_STATE,
      nodes: prev.nodes.map(node => ({ ...node, dragging: false }))
    }));
  }, []);

  // Utility functions
  const getNodeById = useCallback((nodeId: string) => {
    return canvasState.nodes.find(node => node.id === nodeId);
  }, [canvasState.nodes]);

  const getConnectionById = useCallback((connectionId: string) => {
    return canvasState.connections.find(conn => conn.id === connectionId);
  }, [canvasState.connections]);

  const screenToCanvas = useCallback((screenPosition: CanvasPosition): CanvasPosition => {
    if (!canvasRef.current) return screenPosition;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const { zoom, pan } = canvasState.viewState;
    
    return {
      x: (screenPosition.x - rect.left - pan.x) / zoom,
      y: (screenPosition.y - rect.top - pan.y) / zoom
    };
  }, [canvasState.viewState]);

  const canvasToScreen = useCallback((canvasPosition: CanvasPosition): CanvasPosition => {
    if (!canvasRef.current) return canvasPosition;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const { zoom, pan } = canvasState.viewState;
    
    return {
      x: canvasPosition.x * zoom + pan.x + rect.left,
      y: canvasPosition.y * zoom + pan.y + rect.top
    };
  }, [canvasState.viewState]);

  // Copy/Paste operations
  const copySelectedNodes = useCallback(() => {
    const selectedNodes = canvasState.nodes.filter(node => node.selected);
    const selectedConnections = canvasState.connections.filter(conn => 
      selectedNodes.some(node => node.id === conn.sourceNodeId) &&
      selectedNodes.some(node => node.id === conn.targetNodeId)
    );

    setCanvasState(prev => ({
      ...prev,
      clipboard: { nodes: selectedNodes, connections: selectedConnections }
    }));
  }, [canvasState.nodes, canvasState.connections]);

  const pasteNodes = useCallback((position?: CanvasPosition) => {
    if (canvasState.clipboard.nodes.length === 0) return;

    const pastePosition = position || {
      x: canvasState.viewState.pan.x + 100,
      y: canvasState.viewState.pan.y + 100
    };

    // Calculate offset for pasted nodes
    const firstNode = canvasState.clipboard.nodes[0];
    const offsetX = pastePosition.x - firstNode.position.x;
    const offsetY = pastePosition.y - firstNode.position.y;

    // Create new nodes with updated positions and IDs
    const nodeIdMap = new Map<string, string>();
    const newNodes = canvasState.clipboard.nodes.map(node => {
      const newId = generateId();
      nodeIdMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY
        },
        selected: true
      };
    });

    // Create new connections with updated node IDs
    const newConnections = canvasState.clipboard.connections.map(conn => ({
      ...conn,
      id: generateId(),
      sourceNodeId: nodeIdMap.get(conn.sourceNodeId) || conn.sourceNodeId,
      targetNodeId: nodeIdMap.get(conn.targetNodeId) || conn.targetNodeId
    }));

    setCanvasState(prev => ({
      ...prev,
      nodes: [...prev.nodes.map(node => ({ ...node, selected: false })), ...newNodes],
      connections: [...prev.connections, ...newConnections],
      viewState: { ...prev.viewState, selectedNodes: newNodes.map(node => node.id) }
    }));
  }, [canvasState.clipboard]);

  // Additional methods needed by WorkflowCanvas
  const createNode = useCallback((nodeType: NodeType, position: CanvasPosition) => {
    return addNode(nodeType, position);
  }, [addNode]);

  const selectConnection = useCallback((connectionId: string, multi = false) => {
    setCanvasState(prev => {
      const currentSelected = prev.viewState.selectedConnections;
      let newSelected: string[];
      
      if (multi) {
        newSelected = currentSelected.includes(connectionId)
          ? currentSelected.filter(id => id !== connectionId)
          : [...currentSelected, connectionId];
      } else {
        newSelected = [connectionId];
      }
      
      return {
        ...prev,
        viewState: {
          ...prev.viewState,
          selectedConnections: newSelected,
          selectedNodes: multi ? prev.viewState.selectedNodes : []
        }
      };
    });
  }, []);

  const createConnection = useCallback((sourceNodeId: string, targetNodeId: string, sourcePortId?: string, targetPortId?: string) => {
    return addConnection(sourceNodeId, targetNodeId, sourcePortId, targetPortId);
  }, [addConnection]);

  const updateConnection = useCallback((connectionId: string, updates: Partial<WorkflowConnection>) => {
    setCanvasState(prev => ({
      ...prev,
      connections: prev.connections.map(conn => 
        conn.id === connectionId ? { ...conn, ...updates } : conn
      )
    }));
  }, []);

  const deleteSelectedNodes = useCallback(() => {
    const selectedNodeIds = canvasState.viewState.selectedNodes;
    selectedNodeIds.forEach(nodeId => deleteNode(nodeId));
  }, [canvasState.viewState.selectedNodes, deleteNode]);

  return {
    canvasState,
    canvasRef,
    
    // View operations
    setZoom,
    setPan,
    resetView,
    
    // Node operations
    addNode,
    createNode,
    updateNode,
    deleteNode,
    deleteSelectedNodes,
    selectNode,
    clearSelection,
    
    // Connection operations
    addConnection,
    createConnection,
    updateConnection,
    deleteConnection,
    selectConnection,
    
    // Drag operations
    startDrag,
    updateDrag,
    endDrag,
    
    // Utility functions
    getNodeById,
    getConnectionById,
    screenToCanvas,
    canvasToScreen,
    
    // Copy/Paste
    copySelectedNodes,
    pasteNodes
  };
}
