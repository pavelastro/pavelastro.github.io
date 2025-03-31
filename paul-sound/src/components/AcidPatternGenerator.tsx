
import React, { useState, useEffect, useRef } from 'react';
import PatternGrid from './PatternGrid';
import Controls from './Controls';
import AudioEngine from '../utils/audioEngine';

const AcidPatternGenerator: React.FC = () => {
  // State for grid configuration
  const [rows, setRows] = useState<number>(8);
  const [columns, setColumns] = useState<number>(16);
  const [playMode, setPlayMode] = useState<'simultaneous' | 'sequential'>('simultaneous');
  
  // Kick drum state
  const [kickEnabled, setKickEnabled] = useState<boolean>(false);
  const [kickGain, setKickGain] = useState<number>(0.7);
  
  // Initialize sequence with empty arrays for each step
  const [sequence, setSequence] = useState<number[][]>(Array(columns).fill(0).map(() => []));
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(125);
  
  // Ref to store the audio engine instance
  const audioEngineRef = useRef<AudioEngine | null>(null);
  
  // Initialize audio engine
  useEffect(() => {
    const audioEngine = new AudioEngine();
    audioEngine.init();
    audioEngine.setOnStepCallback((step) => {
      setCurrentStep(step);
    });
    audioEngineRef.current = audioEngine;
    
    // Cleanup on unmount
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.cleanup();
      }
    };
  }, []);
  
  // Update sequence in audio engine when it changes
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setSequence(sequence);
      audioEngineRef.current.setPlayMode(playMode);
    }
  }, [sequence, playMode]);
  
  // Update tempo in audio engine when it changes
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setTempo(tempo);
    }
  }, [tempo]);
  
  // Update kick drum settings when they change
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setKickEnabled(kickEnabled);
      audioEngineRef.current.setKickGain(kickGain);
    }
  }, [kickEnabled, kickGain]);
  
  // Update sequence length when columns change
  useEffect(() => {
    const newSequence = [...sequence];
    
    // If columns increased, add empty arrays
    if (columns > newSequence.length) {
      for (let i = newSequence.length; i < columns; i++) {
        newSequence.push([]);
      }
    } 
    // If columns decreased, remove extra columns
    else if (columns < newSequence.length) {
      newSequence.splice(columns);
    }
    
    setSequence(newSequence);
    
    // If playing, restart to avoid issues
    if (isPlaying && audioEngineRef.current) {
      audioEngineRef.current.stop();
      audioEngineRef.current.play();
    }
  }, [columns]);
  
  // Filter out notes outside the valid range when rows change
  useEffect(() => {
    const newSequence = sequence.map(step => {
      return step.filter(note => note < rows);
    });
    
    setSequence(newSequence);
    
    if (audioEngineRef.current) {
      audioEngineRef.current.setRowCount(rows);
    }
    
    // If playing, restart to avoid issues
    if (isPlaying && audioEngineRef.current) {
      audioEngineRef.current.stop();
      audioEngineRef.current.play();
    }
  }, [rows]);
  
  // Toggle play/stop
  const handlePlayToggle = () => {
    if (audioEngineRef.current) {
      if (isPlaying) {
        audioEngineRef.current.stop();
      } else {
        audioEngineRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Change tempo
  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
  };
  
  // Clear sequence
  const handleClear = () => {
    setSequence(Array(columns).fill(0).map(() => []));
  };
  
  // Randomize sequence
  const handleRandomize = () => {
    const newSequence = Array(columns).fill(0).map(() => {
      // For each step, determine how many notes to add (0-3)
      const noteCount = Math.floor(Math.random() * 4);
      const stepNotes: number[] = [];
      
      // Add random notes
      for (let i = 0; i < noteCount; i++) {
        const note = Math.floor(Math.random() * rows);
        // Avoid duplicates
        if (!stepNotes.includes(note)) {
          stepNotes.push(note);
        }
      }
      
      return stepNotes;
    });
    
    setSequence(newSequence);
  };
  
  // Change rows
  const handleRowsChange = (newRows: number) => {
    setRows(newRows);
  };
  
  // Change columns
  const handleColumnsChange = (newColumns: number) => {
    setColumns(newColumns);
  };
  
  // Change play mode
  const handlePlayModeChange = (newMode: 'simultaneous' | 'sequential') => {
    setPlayMode(newMode);
  };
  
  // Toggle kick drum
  const handleKickEnabledChange = (enabled: boolean) => {
    setKickEnabled(enabled);
  };
  
  // Change kick gain
  const handleKickGainChange = (gain: number) => {
    setKickGain(gain);
  };
  
  return (
    <div className="acid-pattern-generator max-w-4xl mx-auto">
      <PatternGrid 
        sequence={sequence} 
        onSequenceChange={setSequence} 
        currentStep={currentStep}
        rows={rows}
        columns={columns}
      />
      
      <Controls 
        isPlaying={isPlaying}
        onPlayToggle={handlePlayToggle}
        tempo={tempo}
        onTempoChange={handleTempoChange}
        onClear={handleClear}
        onRandomize={handleRandomize}
        rows={rows}
        onRowsChange={handleRowsChange}
        columns={columns}
        onColumnsChange={handleColumnsChange}
        playMode={playMode}
        onPlayModeChange={handlePlayModeChange}
        kickEnabled={kickEnabled}
        onKickEnabledChange={handleKickEnabledChange}
        kickGain={kickGain}
        onKickGainChange={handleKickGainChange}
      />
    </div>
  );
};

export default AcidPatternGenerator;
