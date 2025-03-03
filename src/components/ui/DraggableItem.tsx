
import React, { useState, useRef } from 'react';
import { useEditor, ElementType } from '@/context/EditorContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DraggableItemProps {
  icon: React.ReactNode;
  label: string;
  type: ElementType;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ icon, label, type }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const { addElement } = useEditor();
  const touchTimeoutRef = useRef<number | null>(null);
  const initialTouchRef = useRef<{ x: number, y: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('application/reactflow-type', type);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a drag preview
    const preview = document.createElement('div');
    preview.classList.add('element-drag-preview');
    preview.innerHTML = label;
    document.body.appendChild(preview);
    e.dataTransfer.setDragImage(preview, 0, 0);
    
    // Clean up after drag ends
    setTimeout(() => {
      document.body.removeChild(preview);
    }, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Double click to add at center of canvas
  const handleDoubleClick = (e: React.MouseEvent) => {
    // Prevent default behavior to avoid zooming on mobile
    e.preventDefault();
    
    // Add at center of canvas (approximate)
    const x = 300 - 100; // Roughly center of canvas width (600/2) - half element width
    const y = 200; // Arbitrary position in the visible area
    addElement(type, x, y);
    toast.success(`Added ${label} element`);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    // Store the initial touch position
    initialTouchRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };

    // Set a timeout to determine if it's a long press
    touchTimeoutRef.current = window.setTimeout(() => {
      setIsTouchDragging(true);
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 300);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDragging || !initialTouchRef.current) return;
    
    // Prevent default behavior to stop page scrolling and refreshing
    e.preventDefault();
    
    // Find the canvas element
    const canvas = document.querySelector('[data-canvas-drop-area="true"]');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    
    // Check if touch is over the canvas
    const isOverCanvas = 
      touch.clientX >= canvasRect.left &&
      touch.clientX <= canvasRect.right &&
      touch.clientY >= canvasRect.top &&
      touch.clientY <= canvasRect.bottom;
    
    if (isOverCanvas) {
      // Create a visual indicator element
      let indicator = document.getElementById('touch-drag-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'touch-drag-indicator';
        indicator.style.position = 'absolute';
        indicator.style.zIndex = '9999';
        indicator.style.pointerEvents = 'none';
        indicator.style.background = 'rgba(59, 130, 246, 0.3)';
        indicator.style.borderRadius = '4px';
        indicator.style.padding = '10px';
        indicator.style.border = '2px dashed #3b82f6';
        indicator.style.width = '100px';
        indicator.style.height = '50px';
        indicator.style.display = 'flex';
        indicator.style.alignItems = 'center';
        indicator.style.justifyContent = 'center';
        indicator.innerHTML = `<span style="color:white;font-weight:bold;">${label}</span>`;
        document.body.appendChild(indicator);
      }
      
      // Position the indicator where the touch is
      indicator.style.left = `${touch.clientX - 50}px`;
      indicator.style.top = `${touch.clientY - 25}px`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear the timeout to prevent it from firing after touch end
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    // Check if we were dragging
    if (isTouchDragging && initialTouchRef.current) {
      // Find the canvas element
      const canvas = document.querySelector('[data-canvas-drop-area="true"]');
      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const touch = e.changedTouches[0]; // Use changedTouches for touchend
        
        // Check if touch ended over the canvas
        const isOverCanvas = 
          touch.clientX >= canvasRect.left &&
          touch.clientX <= canvasRect.right &&
          touch.clientY >= canvasRect.top &&
          touch.clientY <= canvasRect.bottom;
        
        if (isOverCanvas) {
          // Calculate position relative to canvas
          const scrollTop = (canvas as HTMLElement).scrollTop || 0;
          const scrollLeft = (canvas as HTMLElement).scrollLeft || 0;
          
          // Calculate position with scroll offset
          const x = touch.clientX - canvasRect.left + scrollLeft;
          const y = touch.clientY - canvasRect.top + scrollTop;
          
          // Add the element to the canvas
          addElement(type, x, y);
          toast.success(`Added ${label} element`);
          
          // Prevent default to avoid page refresh on mobile
          e.preventDefault();
        }
      }
      
      // Remove the visual indicator
      const indicator = document.getElementById('touch-drag-indicator');
      if (indicator) {
        document.body.removeChild(indicator);
      }
    } else if (!isTouchDragging && initialTouchRef.current) {
      // This was a tap, not a drag - check if it was a double tap
      const now = new Date().getTime();
      const lastTap = lastTapRef.current || 0;
      
      if (now - lastTap < 300) { // Double tap
        handleDoubleClick(e as unknown as React.MouseEvent);
      }
      
      lastTapRef.current = now;
    }
    
    setIsTouchDragging(false);
    initialTouchRef.current = null;
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-3 bg-white border rounded-md transition-all hover:border-primary hover:shadow-subtle',
        (isDragging || isTouchDragging) && 'opacity-50',
        'active:scale-95' // Add feedback for touch devices
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mb-1 text-muted-foreground">{icon}</div>
      <span className="text-xs">{label}</span>
    </div>
  );
};

export default DraggableItem;
