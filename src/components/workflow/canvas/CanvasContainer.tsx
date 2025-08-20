import React, { useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { CanvasPosition } from '@/types/canvas';
import { useWorkflowCanvas } from '@/hooks/useWorkflowCanvas';
import { CanvasBackground } from './CanvasBackground';

interface CanvasContainerProps {
  className?: string;
  children: React.ReactNode;
}

export function CanvasContainer({ className, children }: CanvasContainerProps) {
  const {
    canvasState,
    canvasRef,
    setPan,
    setZoom,
    clearSelection,
    startDrag,
    updateDrag,
    endDrag,
    screenToCanvas
  } = useWorkflowCanvas();

  const [isPanning, setIsPanning] = useState(false);
  const lastMousePosRef = useRef<CanvasPosition>({ x: 0, y: 0 });

  // Handle mouse events for canvas panning using native DOM events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.altKey || e.shiftKey))) { // Middle mouse or Alt/Shift+Left click for panning
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      startDrag('canvas', { x: e.clientX, y: e.clientY });
    } else if (e.button === 0) { // Left click
      // Check if clicking on empty canvas
      const target = e.target as HTMLElement;
      if (target === canvasRef.current || target.closest('.canvas-background')) {
        clearSelection();
      }
    }
  }, [startDrag, clearSelection]);

  // Use native DOM events for mouse move and up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastMousePosRef.current.x;
        const deltaY = e.clientY - lastMousePosRef.current.y;
        
        setPan({
          x: canvasState.viewState.pan.x + deltaX,
          y: canvasState.viewState.pan.y + deltaY
        });
        
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        updateDrag({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        endDrag();
      }
    };

    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isPanning, canvasState.viewState.pan, setPan, updateDrag, endDrag]);

  // Handle wheel events for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(canvasState.viewState.zoom + delta);
    }
  }, [canvasState.viewState.zoom, setZoom]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing in inputs
      }

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          // Delete selected nodes
          // This will be implemented when we add node deletion
          break;
        case 'Escape':
          clearSelection();
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom(canvasState.viewState.zoom + 0.1);
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom(canvasState.viewState.zoom - 0.1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvasState.viewState.zoom, clearSelection, setZoom, setPan]);

  return (
    <div
      ref={canvasRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-background cursor-grab select-none",
        isPanning && "cursor-grabbing",
        className
      )}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      tabIndex={0}
      style={{ touchAction: 'none' }} // Prevent default touch behaviors
    >
      {/* Background */}
      <CanvasBackground 
        showGrid={true} 
        gridSize={20} 
        zoom={canvasState.viewState.zoom}
        pan={canvasState.viewState.pan}
      />
      
      {/* Canvas transform container */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${canvasState.viewState.pan.x}px, ${canvasState.viewState.pan.y}px) scale(${canvasState.viewState.zoom})`,
          willChange: 'transform'
        }}
      >
        {children}
      </div>
      
      {/* Canvas info overlay - hidden by default */}
      {false && (
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1 text-xs text-muted-foreground">
          Zoom: {Math.round(canvasState.viewState.zoom * 100)}% | 
          Nodes: {canvasState.nodes.length} | 
          Connections: {canvasState.connections.length}
        </div>
      )}
    </div>
  );
}
