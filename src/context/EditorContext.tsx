
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { convertStyleToInline, elementToHtml } from '../utils/exportHelpers';

export type ElementType = 'box' | 'text' | 'heading' | 'image' | 'button' | 'divider';

export interface ElementStyle {
  width?: string;
  height?: string;
  backgroundColor?: string;
  color?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textDecoration?: string;
  opacity?: string;
  overflow?: string;
  [key: string]: string | undefined;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  content: string;
  style: ElementStyle;
  x: number;
  y: number;
  parentId?: string;
}

interface EditorContextType {
  elements: CanvasElement[];
  selectedElement: CanvasElement | null;
  addElement: (type: ElementType, x: number, y: number) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  moveElement: (id: string, x: number, y: number) => void;
  updateElementStyle: (id: string, style: Partial<ElementStyle>) => void;
  exportHtml: () => string;
  canvasScale: number;
  setCanvasScale: (scale: number) => void;
  setElementParent: (elementId: string, parentId: string | undefined) => void;
  getElementChildren: (parentId: string) => CanvasElement[];
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [canvasScale, setCanvasScale] = useState<number>(1);

  const generateId = () => `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const getDefaultStyle = (type: ElementType): ElementStyle => {
    switch (type) {
      case 'box':
        return {
          width: '200px',
          height: '100px',
          backgroundColor: '#ffffff',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: '#e5e7eb',
          borderRadius: '4px',
          padding: '16px',
          overflow: 'visible',
        };
      case 'text':
        return {
          color: '#374151',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '1.5',
        };
      case 'heading':
        return {
          color: '#111827',
          fontSize: '24px',
          fontWeight: '600',
          lineHeight: '1.2',
        };
      case 'image':
        return {
          width: '200px',
          height: 'auto',
          borderRadius: '4px',
          overflow: 'hidden', // Add overflow hidden for images with border radius
        };
      case 'button':
        return {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '4px',
          fontWeight: '500',
          fontSize: '16px',
          textAlign: 'center',
          cursor: 'pointer',
        };
      case 'divider':
        return {
          width: '100%',
          height: '1px',
          backgroundColor: '#e5e7eb',
          margin: '16px 0',
        };
      default:
        return {};
    }
  };

  const getDefaultContent = (type: ElementType): string => {
    switch (type) {
      case 'text':
        return 'This is a paragraph of text. Click to edit.';
      case 'heading':
        return 'This is a heading';
      case 'button':
        return 'Click me';
      case 'image':
        return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80';
      default:
        return '';
    }
  };

  // Check if an element is inside a box
  const isElementOverBox = (x: number, y: number): string | undefined => {
    // Only boxes can be parents
    const boxes = elements.filter(el => el.type === 'box');
    
    // Check each box from top to bottom of the stack (reverse of rendering order)
    for (let i = boxes.length - 1; i >= 0; i--) {
      const box = boxes[i];
      const boxX = box.x;
      const boxY = box.y;
      const boxWidth = parseInt(box.style.width || '0', 10);
      const boxHeight = parseInt(box.style.height || '0', 10);
      
      if (
        x >= boxX && 
        x <= boxX + boxWidth && 
        y >= boxY && 
        y <= boxY + boxHeight
      ) {
        return box.id;
      }
    }
    
    return undefined;
  };

  const addElement = useCallback((type: ElementType, x: number, y: number) => {
    const newElement: CanvasElement = {
      id: generateId(),
      type,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
      x,
      y,
    };
    
    // Check if the new element is being placed over a box
    if (type !== 'box') {
      const parentId = isElementOverBox(x, y);
      if (parentId) {
        newElement.parentId = parentId;
      }
    }

    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement);
  }, [elements]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((element) => (element.id === id ? { ...element, ...updates } : element))
    );

    // Update selected element if it's the one being updated
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement((prev) => (prev ? { ...prev, ...updates } : prev));
    }
  }, [selectedElement]);

  const deleteElement = useCallback((id: string) => {
    // Also remove any children elements
    setElements((prev) => prev.filter((element) => element.id !== id && element.parentId !== id));
    
    // Deselect if the deleted element was selected
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const selectElement = useCallback((id: string | null) => {
    if (!id) {
      setSelectedElement(null);
      return;
    }

    const element = elements.find((el) => el.id === id);
    setSelectedElement(element || null);
  }, [elements]);

  const moveElement = useCallback((id: string, x: number, y: number) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    // Check if the element is being moved over a box
    let parentId: string | undefined = undefined;
    if (element.type !== 'box') {
      parentId = isElementOverBox(x, y);
    }
    
    setElements((prev) =>
      prev.map((element) => 
        element.id === id ? { ...element, x, y, parentId } : element
      )
    );
  }, [elements]);

  const updateElementStyle = useCallback((id: string, style: Partial<ElementStyle>) => {
    // For images with border-radius, automatically add overflow: hidden
    if (style.borderRadius) {
      const element = elements.find(el => el.id === id);
      if (element?.type === 'image') {
        style.overflow = 'hidden';
      }
    }
    
    setElements((prev) =>
      prev.map((element) =>
        element.id === id ? { ...element, style: { ...element.style, ...style } } : element
      )
    );

    // Update selected element if it's the one being updated
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement((prev) =>
        prev ? { ...prev, style: { ...prev.style, ...style } } : prev
      );
    }
  }, [selectedElement, elements]);

  const setElementParent = useCallback((elementId: string, parentId: string | undefined) => {
    setElements(prev => 
      prev.map(element => 
        element.id === elementId ? { ...element, parentId } : element
      )
    );
  }, []);

  const getElementChildren = useCallback((parentId: string) => {
    return elements.filter(element => element.parentId === parentId);
  }, [elements]);

  const getElementHtml = (element: CanvasElement, childrenHtml = ''): string => {
    const styleString = convertStyleToInline(element.style);
    
    switch (element.type) {
      case 'box':
        return `<div style="${styleString}">${childrenHtml}</div>`;
      case 'text':
        return `<p style="${styleString}">${element.content}</p>`;
      case 'heading':
        return `<h2 style="${styleString}">${element.content}</h2>`;
      case 'image':
        return `<img src="${element.content}" alt="Image" style="${styleString}" />`;
      case 'button':
        return `<button style="${styleString}">${element.content}</button>`;
      case 'divider':
        return `<hr style="${styleString}" />`;
      default:
        return '';
    }
  };

  const exportHtml = useCallback(() => {
    // Create a structured representation of the elements
    const topLevelElements = elements.filter(el => !el.parentId);
    
    const renderElement = (element: CanvasElement): string => {
      const children = elements.filter(el => el.parentId === element.id);
      const childrenHtml = children.map(renderElement).join('\n');
      return getElementHtml(element, childrenHtml);
    };
    
    // Sort top-level elements by Y position and then X position
    const sortedElements = [...topLevelElements].sort((a, b) => {
      if (a.y !== b.y) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });
    
    const elementsHtml = sortedElements.map(renderElement).join('\n');
    
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td>
        ${elementsHtml}
      </td>
    </tr>
  </table>
</body>
</html>`;

    return fullHtml;
  }, [elements]);

  const contextValue: EditorContextType = {
    elements,
    selectedElement,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    moveElement,
    updateElementStyle,
    exportHtml,
    canvasScale,
    setCanvasScale,
    setElementParent,
    getElementChildren,
  };

  return <EditorContext.Provider value={contextValue}>{children}</EditorContext.Provider>;
};
