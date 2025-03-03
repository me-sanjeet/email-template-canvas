import React, { useState, useRef, useEffect } from 'react';
import { useEditor, CanvasElement as ElementType } from '@/context/EditorContext';

interface CanvasElementProps {
  element: ElementType;
  isSelected: boolean;
}

const CanvasElement: React.FC<CanvasElementProps> = ({ element, isSelected }) => {
  const { selectElement, updateElement, moveElement, updateElementStyle } = useEditor();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Reference to track initial dimensions
  const initialSizeRef = useRef({ width: 0, height: 0 });
  
  useEffect(() => {
    if (elementRef.current && isSelected) {
      // Store initial dimensions when element is selected
      const style = window.getComputedStyle(elementRef.current);
      initialSizeRef.current = {
        width: parseFloat(style.width),
        height: parseFloat(style.height),
      };
    }
  }, [isSelected]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isSelected) {
      selectElement(element.id);
      return;
    }
    
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      handleResizeStart(e);
      return;
    }
    
    // Start dragging
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    
    // Add listeners for dragging
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      
      moveElement(element.id, element.x + dx, element.y + dy);
      setStartPos({ x: e.clientX, y: e.clientY });
    } else if (isResizing && resizeDirection) {
      handleResize(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Add touch event handlers for mobile support with prevent default
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    
    if (!isSelected) {
      selectElement(element.id);
      return;
    }
    
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      handleTouchResizeStart(e);
      return;
    }
    
    // Start dragging
    setIsDragging(true);
    setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    
    // Prevent default to avoid any potential page refresh or other browser behaviors
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Always prevent default to avoid page scrolling while dragging
    e.preventDefault();
    
    if (isDragging) {
      const dx = e.touches[0].clientX - startPos.x;
      const dy = e.touches[0].clientY - startPos.y;
      
      moveElement(element.id, element.x + dx, element.y + dy);
      setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (isResizing && resizeDirection) {
      handleTouchResize(e);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Prevent default to ensure no unintended browser actions
    e.preventDefault();
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    
    // Determine which handle was grabbed
    const target = e.target as HTMLElement;
    setResizeDirection(target.dataset.direction || null);
    
    // Set starting position
    setStartPos({ x: e.clientX, y: e.clientY });
    
    // Store the current element size
    if (elementRef.current) {
      const style = window.getComputedStyle(elementRef.current);
      setStartSize({
        width: parseFloat(style.width),
        height: parseFloat(style.height),
      });
    }
    
    // Add event listeners for resize
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchResizeStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    
    // Determine which handle was grabbed
    const target = e.target as HTMLElement;
    setResizeDirection(target.dataset.direction || null);
    
    // Set starting position
    setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    
    // Store the current element size
    if (elementRef.current) {
      const style = window.getComputedStyle(elementRef.current);
      setStartSize({
        width: parseFloat(style.width),
        height: parseFloat(style.height),
      });
    }
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !resizeDirection) return;
    
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    
    let newWidth = startSize.width;
    let newHeight = startSize.height;
    
    // Update width based on direction
    if (resizeDirection.includes('e')) {
      newWidth = Math.max(20, startSize.width + dx);
    } else if (resizeDirection.includes('w')) {
      newWidth = Math.max(20, startSize.width - dx);
      if (newWidth !== startSize.width) {
        moveElement(element.id, element.x + (startSize.width - newWidth), element.y);
      }
    }
    
    // Update height based on direction
    if (resizeDirection.includes('s')) {
      newHeight = Math.max(20, startSize.height + dy);
    } else if (resizeDirection.includes('n')) {
      newHeight = Math.max(20, startSize.height - dy);
      if (newHeight !== startSize.height) {
        moveElement(element.id, element.x, element.y + (startSize.height - newHeight));
      }
    }
    
    // Update element style with new dimensions
    updateElementStyle(element.id, {
      width: `${newWidth}px`,
      height: element.type !== 'text' && element.type !== 'heading' ? `${newHeight}px` : 'auto' as any,
    });
  };

  const handleTouchResize = (e: React.TouchEvent) => {
    if (!isResizing || !resizeDirection) return;
    
    const dx = e.touches[0].clientX - startPos.x;
    const dy = e.touches[0].clientY - startPos.y;
    
    let newWidth = startSize.width;
    let newHeight = startSize.height;
    
    // Update width based on direction
    if (resizeDirection.includes('e')) {
      newWidth = Math.max(20, startSize.width + dx);
    } else if (resizeDirection.includes('w')) {
      newWidth = Math.max(20, startSize.width - dx);
      if (newWidth !== startSize.width) {
        moveElement(element.id, element.x + (startSize.width - newWidth), element.y);
      }
    }
    
    // Update height based on direction
    if (resizeDirection.includes('s')) {
      newHeight = Math.max(20, startSize.height + dy);
    } else if (resizeDirection.includes('n')) {
      newHeight = Math.max(20, startSize.height - dy);
      if (newHeight !== startSize.height) {
        moveElement(element.id, element.x, element.y + (startSize.height - newHeight));
      }
    }
    
    // Update element style with new dimensions
    updateElementStyle(element.id, {
      width: `${newWidth}px`,
      height: element.type !== 'text' && element.type !== 'heading' ? `${newHeight}px` : 'auto' as any,
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    updateElement(element.id, { content: e.target.value });
  };

  // Render different elements based on type
  const renderElement = () => {
    switch (element.type) {
      case 'box':
        return <div className="w-full h-full"></div>;
      case 'text':
        return isSelected ? (
          <textarea
            className="w-full h-full bg-transparent resize-none focus:outline-none border-none p-0"
            value={element.content}
            onChange={handleTextChange}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p>{element.content}</p>
        );
      case 'heading':
        return isSelected ? (
          <input
            type="text"
            className="w-full bg-transparent focus:outline-none border-none p-0"
            value={element.content}
            onChange={handleTextChange}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h2>{element.content}</h2>
        );
      case 'image':
        return <img src={element.content} alt="Element" className="w-full h-full object-cover" />;
      case 'button':
        return isSelected ? (
          <input
            type="text"
            className="w-full text-center bg-transparent focus:outline-none border-none p-0"
            value={element.content}
            onChange={handleTextChange}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <button>{element.content}</button>
        );
      case 'divider':
        return <hr />;
      default:
        return null;
    }
  };

  const getInlineStyle = () => {
    // Convert style object to inline style
    const style: React.CSSProperties = {
      position: 'absolute',
      transform: `translate(${element.x}px, ${element.y}px)`,
      zIndex: isSelected ? 10 : 1,
      ...Object.entries(element.style).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          // Convert camelCase to CSS property name
          acc[key as keyof React.CSSProperties] = value as any;
        }
        return acc;
      }, {} as React.CSSProperties),
    };
    
    return style;
  };

  return (
    <div 
      ref={elementRef}
      className={`canvas-element ${isSelected ? 'selected' : ''}`}
      style={getInlineStyle()}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {renderElement()}
      
      {/* Resize handles - only shown when selected */}
      {isSelected && element.type !== 'divider' && (
        <>
          <div 
            className="resize-handle resize-handle-nw"
            data-direction="nw"
            onMouseDown={handleResizeStart}
            onTouchStart={handleTouchResizeStart}
          />
          <div 
            className="resize-handle resize-handle-ne"
            data-direction="ne"
            onMouseDown={handleResizeStart}
            onTouchStart={handleTouchResizeStart}
          />
          <div 
            className="resize-handle resize-handle-sw"
            data-direction="sw"
            onMouseDown={handleResizeStart}
            onTouchStart={handleTouchResizeStart}
          />
          <div 
            className="resize-handle resize-handle-se"
            data-direction="se"
            onMouseDown={handleResizeStart}
            onTouchStart={handleTouchResizeStart}
          />
        </>
      )}
    </div>
  );
};

export default CanvasElement;
