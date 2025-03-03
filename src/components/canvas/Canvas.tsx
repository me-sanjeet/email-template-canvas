
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useEditor, ElementType } from '@/context/EditorContext';
import CanvasElement from './CanvasElement';
import { toast } from 'sonner';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { elements, addElement, selectElement, selectedElement, canvasScale } = useEditor();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Detect clicks on the canvas itself (not on elements) to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      selectElement(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
    
    // Change cursor to indicate drop is possible
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const elementType = e.dataTransfer.getData('application/reactflow-type') as ElementType;
    if (!elementType || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scrollTop = canvasRef.current.scrollTop;
    const scrollLeft = canvasRef.current.scrollLeft;
    
    // Calculate position relative to canvas and adjusted for scroll and scale
    const x = (e.clientX - canvasRect.left + scrollLeft) / canvasScale;
    const y = (e.clientY - canvasRect.top + scrollTop) / canvasScale;
    
    // Add element at the drop position
    addElement(elementType, x, y);
    toast.success(`Element added successfully!`);
  };

  // Set up a visual indicator for mobile users when canvas is empty
  useEffect(() => {
    if (elements.length === 0) {
      const pulseDot = document.createElement('div');
      pulseDot.id = 'canvas-pulse-indicator';
      pulseDot.className = 'animate-pulse';
      pulseDot.style.position = 'absolute';
      pulseDot.style.top = '50%';
      pulseDot.style.left = '50%';
      pulseDot.style.transform = 'translate(-50%, -50%)';
      pulseDot.style.width = '20px';
      pulseDot.style.height = '20px';
      pulseDot.style.borderRadius = '50%';
      pulseDot.style.backgroundColor = 'rgba(59, 130, 246, 0.5)';
      pulseDot.style.pointerEvents = 'none';
      
      if (canvasRef.current) {
        canvasRef.current.appendChild(pulseDot);
      }
      
      return () => {
        if (pulseDot && pulseDot.parentNode) {
          pulseDot.parentNode.removeChild(pulseDot);
        }
      };
    }
  }, [elements.length]);

  // Create a hierarchy of elements to render
  // First render box elements that can contain other elements
  const boxElements = elements.filter(el => el.type === 'box' && !el.parentId);
  // Then render non-box top level elements
  const topLevelNonBoxElements = elements.filter(el => el.type !== 'box' && !el.parentId);

  return (
    <div className="h-full flex items-center justify-center p-4 overflow-auto">
      <div 
        className={`relative w-[600px] min-h-[800px] bg-white border shadow-sm mx-auto transition-all ${
          isDraggingOver ? 'ring-4 ring-primary ring-opacity-50' : ''
        }`}
        ref={canvasRef}
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          transform: `scale(${canvasScale})`,
          transformOrigin: 'center top',
          minHeight: '800px',
        }}
        data-canvas-drop-area="true" // Add data attribute for identifying canvas in touch handlers
      >
        {/* Render box elements first */}
        {boxElements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
          />
        ))}
        
        {/* Render non-box top level elements */}
        {topLevelNonBoxElements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
          />
        ))}
        
        {elements.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 animate-fade-in">
            <div className="flex items-center justify-center bg-gray-50 rounded-full w-16 h-16 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-center px-4">
              <span className="block font-medium text-gray-500">Drag and drop components here</span>
              <span className="text-sm block mt-1">or double-click on components to add them</span>
            </p>
            <div className="mt-4 text-sm bg-blue-50 text-blue-700 p-3 rounded-md">
              <span className="hidden md:inline">Drag from the left panel</span>
              <span className="md:hidden">Tap and hold on a component to drag it here</span>
            </div>
          </div>
        ) : (
          // Show a subtle guide when there are elements
          <div className="absolute bottom-4 right-4 bg-white border shadow-sm rounded-md p-2 text-xs text-gray-500 pointer-events-none opacity-80">
            <p>Click to select elements</p>
            <p className="hidden md:block">Drag to move elements</p>
            <p className="md:hidden">Tap+hold to move elements</p>
            <p>Drop elements onto boxes to nest them</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
