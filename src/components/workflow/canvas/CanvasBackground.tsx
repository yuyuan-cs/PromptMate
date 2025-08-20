import React from 'react';
import { cn } from '@/lib/utils';

interface CanvasBackgroundProps {
  className?: string;
  showGrid?: boolean;
  gridSize?: number;
  zoom?: number;
  pan?: { x: number; y: number };
}

export function CanvasBackground({ 
  className, 
  showGrid = true, 
  gridSize = 20,
  zoom = 1,
  pan = { x: 0, y: 0 }
}: CanvasBackgroundProps) {
  const adjustedGridSize = gridSize * zoom;
  const backgroundX = pan.x % adjustedGridSize;
  const backgroundY = pan.y % adjustedGridSize;
  
  return (
    <div 
      className={cn(
        "absolute inset-0 canvas-background",
        className
      )}
      style={{
        backgroundImage: showGrid ? `
          radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)
        ` : undefined,
        backgroundSize: showGrid ? `${adjustedGridSize}px ${adjustedGridSize}px` : undefined,
        backgroundPosition: showGrid ? `${backgroundX}px ${backgroundY}px` : '0 0',
      }}
    />
  );
}
