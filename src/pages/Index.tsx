
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { EditorProvider } from '@/context/EditorContext';

const Index = () => {
  return (
    <EditorProvider>
      <AppLayout />
    </EditorProvider>
  );
};

export default Index;
