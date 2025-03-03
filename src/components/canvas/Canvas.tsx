
import React, { useRef, useState, useCallback } from 'react';
import { useEditor, ElementType } from '@/context/EditorContext';
import CanvasElement from './CanvasElement';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { elements, addElement, selectElement, selectedElement, canvasScale } = useEditor();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If clicking directly on the canvas (not on an element), deselect
    if (e.target === canvasRef.current) {
      selectElement(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
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
    
    addElement(elementType, x, y);
  };

  return (
    <div className="h-full flex items-center justify-center p-4 overflow-auto">
      <div 
        className={`relative w-[600px] min-h-[800px] bg-white border shadow-sm mx-auto transition-all ${
          isDraggingOver ? 'ring-2 ring-primary ring-opacity-50' : ''
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
      >
        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
          />
        ))}
        
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p className="text-center">
              Drag and drop components here<br />or click on the components panel
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
