
import React from 'react';
import { Box, Type, Heading, Image, Button as ButtonIcon, Minus as MinusIcon } from 'lucide-react';
import DraggableItem from '../ui/DraggableItem';
import { Separator } from '@/components/ui/separator';
import { ElementType } from '@/context/EditorContext';

const ComponentsPanel: React.FC = () => {
  const components = [
    { icon: <Box size={20} />, label: 'Box', type: 'box' as ElementType },
    { icon: <Type size={20} />, label: 'Text', type: 'text' as ElementType },
    { icon: <Heading size={20} />, label: 'Heading', type: 'heading' as ElementType },
    { icon: <Image size={20} />, label: 'Image', type: 'image' as ElementType },
    { icon: <ButtonIcon size={20} />, label: 'Button', type: 'button' as ElementType },
    { icon: <MinusIcon size={20} />, label: 'Divider', type: 'divider' as ElementType },
  ];

  return (
    <div className="h-full p-4 overflow-y-auto">
      <h2 className="text-sm font-medium mb-4">Components</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Drag to add to canvas</p>
          <div className="grid grid-cols-2 gap-2">
            {components.map((component) => (
              <DraggableItem
                key={component.type}
                icon={component.icon}
                label={component.label}
                type={component.type}
              />
            ))}
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium mb-2">Templates</h3>
          <p className="text-xs text-muted-foreground mb-2">Click to load a template</p>
          <div className="space-y-2">
            <div className="border rounded-md p-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="aspect-[3/4] bg-muted rounded-md mb-2 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Coming soon</span>
              </div>
              <p className="text-xs">Basic Newsletter</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentsPanel;
