import React from 'react';

interface PatternGridProps {
  sequence: number[][];
  onSequenceChange: (newSequence: number[][]) => void;
  currentStep: number;
  rows: number;
  columns: number;
}

const PatternGrid: React.FC<PatternGridProps> = ({ 
  sequence, 
  onSequenceChange, 
  currentStep,
  rows,
  columns
}) => {
  // Generate note labels based on rows
  const generateNoteLabels = (rowCount: number) => {
    const baseNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const labels: string[] = [];
    
    // Start from A2 and go up
    let octave = 2;
    let noteIndex = 9; // A is at index 9
    
    for (let i = 0; i < rowCount; i++) {
      labels.push(`${baseNotes[noteIndex]}${octave}`);
      
      // Move to next note
      noteIndex++;
      if (noteIndex >= baseNotes.length) {
        noteIndex = 0;
        octave++;
      }
    }
    
    return labels.reverse(); // Reverse so highest note is at the top
  };
  
  // Toggle a step in the sequence
  const toggleStep = (row: number, step: number) => {
    const newSequence = [...sequence];
    
    // Ensure the column exists
    if (!newSequence[step]) {
      newSequence[step] = [];
    }
    
    // Check if this cell is already selected
    const columnNotes = newSequence[step];
    const noteIndex = columnNotes.indexOf(row);
    
    if (noteIndex !== -1) {
      // If the note is already in this column, remove it
      columnNotes.splice(noteIndex, 1);
    } else {
      // Otherwise, add this note to the column
      columnNotes.push(row);
    }
    
    onSequenceChange(newSequence);
  };

  // Create the grid UI
  const renderGrid = () => {
    const grid = [];
    const noteLabels = generateNoteLabels(rows);
    
    // Create rows from bottom to top (lowest note to highest)
    for (let row = rows - 1; row >= 0; row--) {
      const rowButtons = [];
      
      // Create step buttons for each row
      for (let step = 0; step < columns; step++) {
        const isActive = sequence[step] && sequence[step].includes(row);
        const isCurrentStep = step === currentStep && currentStep !== -1;
        
        rowButtons.push(
          <div 
            key={`${row}-${step}`}
            className={`step-button ${isActive ? 'active' : ''} ${isCurrentStep ? 'border-acid-cyan' : ''}`}
            onClick={() => toggleStep(row, step)}
            aria-label={`Toggle ${noteLabels[rows - 1 - row]} at step ${step + 1}`}
          />
        );
      }
      
      grid.push(
        <div key={`row-${row}`} className="sequencer-row">
          <div className="w-10 text-right mr-2 text-acid-neon font-mono text-xs">
            {noteLabels[rows - 1 - row]}
          </div>
          {rowButtons}
        </div>
      );
    }
    
    return grid;
  };

  return (
    <div className="pattern-grid p-4 bg-black border border-acid-grid rounded-md overflow-x-auto">
      <div className="min-w-fit">
        {renderGrid()}
      </div>
    </div>
  );
};

export default PatternGrid;
