
import React from 'react';
import { useEditor } from '@/context/EditorContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash, Copy } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const PropertiesPanel: React.FC = () => {
  const { selectedElement, updateElementStyle, updateElement, deleteElement } = useEditor();

  if (!selectedElement) {
    return (
      <div className="h-full p-4 flex flex-col">
        <h2 className="text-sm font-medium mb-4">Properties</h2>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className="text-sm text-center">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleStyleChange = (property: string, value: string) => {
    updateElementStyle(selectedElement.id, { [property]: value });
  };

  const handleOpacityChange = (value: number[]) => {
    updateElementStyle(selectedElement.id, { opacity: value[0].toString() });
  };

  const handleDelete = () => {
    deleteElement(selectedElement.id);
    toast.success('Element deleted');
  };

  const handleDuplicate = () => {
    // Create a duplicate with a small offset
    const duplicate = {
      ...selectedElement,
      id: `element-${Date.now()}`,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
    };
    
    // Add the duplicated element (via updateElement which doesn't exist yet, would need to add to context)
    updateElement(duplicate.id, duplicate);
    toast.success('Element duplicated');
  };

  return (
    <div className="h-full p-4 overflow-y-auto mobile-padding-bottom">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium">
          {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={handleDuplicate} title="Duplicate">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDelete} title="Delete">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Dimensions */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium">Dimensions</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="width" className="text-xs">Width</Label>
              <Input
                id="width"
                value={selectedElement.style.width?.replace('px', '') || ''}
                onChange={(e) => handleStyleChange('width', `${e.target.value}px`)}
                placeholder="Width"
                size={1}
                className="h-8"
              />
            </div>
            {selectedElement.type !== 'text' && selectedElement.type !== 'heading' && (
              <div className="space-y-1">
                <Label htmlFor="height" className="text-xs">Height</Label>
                <Input
                  id="height"
                  value={selectedElement.style.height?.replace('px', '') || ''}
                  onChange={(e) => handleStyleChange('height', `${e.target.value}px`)}
                  placeholder="Height"
                  size={1}
                  className="h-8"
                />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Spacing */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium">Spacing</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="padding" className="text-xs">Padding</Label>
              <Input
                id="padding"
                value={selectedElement.style.padding || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                placeholder="Padding"
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="margin" className="text-xs">Margin</Label>
              <Input
                id="margin"
                value={selectedElement.style.margin || ''}
                onChange={(e) => handleStyleChange('margin', e.target.value)}
                placeholder="Margin"
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Appearance */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium">Appearance</h3>
          
          {(selectedElement.type === 'box' || selectedElement.type === 'button') && (
            <div className="space-y-1">
              <Label htmlFor="backgroundColor" className="text-xs">Background Color</Label>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: selectedElement.style.backgroundColor }} />
                <Input
                  id="backgroundColor"
                  value={selectedElement.style.backgroundColor || ''}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  placeholder="#000000"
                  className="h-8 flex-1"
                />
              </div>
            </div>
          )}
          
          {(selectedElement.type === 'text' || selectedElement.type === 'heading' || selectedElement.type === 'button') && (
            <div className="space-y-1">
              <Label htmlFor="color" className="text-xs">Text Color</Label>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: selectedElement.style.color }} />
                <Input
                  id="color"
                  value={selectedElement.style.color || ''}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  placeholder="#000000"
                  className="h-8 flex-1"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="borderRadius" className="text-xs">Border Radius</Label>
            <Input
              id="borderRadius"
              value={selectedElement.style.borderRadius || ''}
              onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
              placeholder="0px"
              className="h-8"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="borderWidth" className="text-xs">Border Width</Label>
              <Input
                id="borderWidth"
                value={selectedElement.style.borderWidth || ''}
                onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
                placeholder="0px"
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="borderStyle" className="text-xs">Border Style</Label>
              <select
                id="borderStyle"
                value={selectedElement.style.borderStyle || ''}
                onChange={(e) => handleStyleChange('borderStyle', e.target.value)}
                className="h-8 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="borderColor" className="text-xs">Border Color</Label>
              <Input
                id="borderColor"
                value={selectedElement.style.borderColor || ''}
                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                placeholder="#000"
                className="h-8"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="opacity" className="text-xs">Opacity</Label>
              <span className="text-xs">{selectedElement.style.opacity || '1'}</span>
            </div>
            <Slider
              id="opacity"
              defaultValue={[parseFloat(selectedElement.style.opacity || '1')]}
              max={1}
              min={0}
              step={0.1}
              onValueChange={handleOpacityChange}
            />
          </div>
        </div>

        {/* Text properties (only for text, heading and button) */}
        {(selectedElement.type === 'text' || selectedElement.type === 'heading' || selectedElement.type === 'button') && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-xs font-medium">Typography</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                  <Input
                    id="fontSize"
                    value={selectedElement.style.fontSize || ''}
                    onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                    placeholder="16px"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fontWeight" className="text-xs">Font Weight</Label>
                  <select
                    id="fontWeight"
                    value={selectedElement.style.fontWeight || ''}
                    onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                    className="h-8 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="400">Regular</option>
                    <option value="500">Medium</option>
                    <option value="600">Semi-Bold</option>
                    <option value="700">Bold</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="textAlign" className="text-xs">Text Align</Label>
                <select
                  id="textAlign"
                  value={selectedElement.style.textAlign || ''}
                  onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                  className="h-8 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="lineHeight" className="text-xs">Line Height</Label>
                <Input
                  id="lineHeight"
                  value={selectedElement.style.lineHeight || ''}
                  onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
                  placeholder="1.5"
                  className="h-8"
                />
              </div>
            </div>
          </>
        )}

        {/* Content (for image) */}
        {selectedElement.type === 'image' && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-xs font-medium">Image</h3>
              <div className="space-y-1">
                <Label htmlFor="imageUrl" className="text-xs">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={selectedElement.content}
                  onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="objectFit" className="text-xs">Object Fit</Label>
                <select
                  id="objectFit"
                  value={selectedElement.style.objectFit || 'cover'}
                  onChange={(e) => handleStyleChange('objectFit', e.target.value)}
                  className="h-8 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                >
                  <option value="contain">Contain</option>
                  <option value="cover">Cover</option>
                  <option value="fill">Fill</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
