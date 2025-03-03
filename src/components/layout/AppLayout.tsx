
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Upload, Download, Plus, Minus } from 'lucide-react';
import ComponentsPanel from '@/components/panels/ComponentsPanel';
import PropertiesPanel from '@/components/panels/PropertiesPanel';
import Canvas from '@/components/canvas/Canvas';
import { useEditor } from '@/context/EditorContext';
import { toast } from 'sonner';

const AppLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const [leftPanelOpen, setLeftPanelOpen] = useState(!isMobile);
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile);
  const { exportHtml, canvasScale, setCanvasScale } = useEditor();

  const toggleLeftPanel = () => setLeftPanelOpen(!leftPanelOpen);
  const toggleRightPanel = () => setRightPanelOpen(!rightPanelOpen);
  
  const handleExport = () => {
    const html = exportHtml();
    // Create a blob with the HTML content
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-template.html';
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    toast.success('Template exported successfully!');
  };

  const zoomIn = () => {
    if (canvasScale < 2) {
      setCanvasScale(canvasScale + 0.1);
    }
  };

  const zoomOut = () => {
    if (canvasScale > 0.5) {
      setCanvasScale(canvasScale - 0.1);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-medium tracking-tight">Email Template Designer</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-muted rounded-md p-1 mr-2">
            <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-2 text-sm">
              {Math.round(canvasScale * 100)}%
            </span>
            <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className={isMobile ? 'sr-only' : ''}>Export HTML</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Components */}
        <div
          className={`${
            leftPanelOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 hidden'
          } transition-all duration-300 bg-white border-r overflow-hidden lg:block lg:opacity-100 ${
            leftPanelOpen ? 'lg:w-72' : 'lg:w-0'
          }`}
        >
          <ComponentsPanel />
        </div>

        {/* Mobile Toggle for Left Panel */}
        {isMobile && (
          <button
            onClick={toggleLeftPanel}
            className={`absolute top-20 left-0 z-10 p-2 shadow-md bg-white border rounded-r-lg`}
          >
            {leftPanelOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        )}

        {/* Main Canvas */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <Canvas />
        </div>

        {/* Mobile Toggle for Right Panel */}
        {isMobile && (
          <button
            onClick={toggleRightPanel}
            className={`absolute top-20 right-0 z-10 p-2 shadow-md bg-white border rounded-l-lg`}
          >
            {rightPanelOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        )}

        {/* Right Panel - Properties */}
        <div
          className={`${
            rightPanelOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 hidden'
          } transition-all duration-300 bg-white border-l overflow-hidden lg:block lg:opacity-100 ${
            rightPanelOpen ? 'lg:w-72' : 'lg:w-0'
          }`}
        >
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
