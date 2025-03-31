import React from 'react';
import AcidPatternGenerator from '@/components/AcidPatternGenerator';
const Index = () => {
  return <div className="min-h-screen flex flex-col bg-acid-bg p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-acid-neon mb-2 animate-pulse-neon">Sound of Paul</h1>
        <p className="text-gray-400 text-sm md:text-base">Create your own bass patterns with this sequencer. Click the grid to add notes.</p>
      </header>
      
      <main className="flex-grow">
        <AcidPatternGenerator />
      </main>
      
      <footer className="mt-12 text-center text-gray-500 text-xs">
        <p className="mb-1">Click any cell to toggle a note. Hit play to hear your pattern.</p>
        <p>I will probably make adjustments to it. It looks like Tron Legacy. Adjust tempo with the slider.</p>
      </footer>
    </div>;
};
export default Index;