
import React, { useState } from 'react';
import { useEditor, ElementType } from '@/context/EditorContext';
import { cn } from '@/lib/utils';

interface DraggableItemProps {
  icon: React.ReactNode;
  label: string;
  type: ElementType;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ icon, label, type }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { addElement } = useEditor();

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
  const handleDoubleClick = () => {
    // Add at center of canvas (approximate)
    const x = 300 - 100; // Roughly center of canvas width (600/2) - half element width
    const y = 200; // Arbitrary position in the visible area
    addElement(type, x, y);
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-3 bg-white border rounded-md cursor-grab transition-all hover:border-primary hover:shadow-subtle',
        isDragging && 'opacity-50'
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDoubleClick={handleDoubleClick}
    >
      <div className="mb-1 text-muted-foreground">{icon}</div>
      <span className="text-xs">{label}</span>
    </div>
  );
};

export default DraggableItem;
