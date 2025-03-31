
// This is a simplified audio engine to create acid-like basslines

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private filters: BiquadFilterNode[] = [];
  private gains: GainNode[] = [];
  private isPlaying = false;
  private sequence: number[][] = [];
  private tempo = 125; // BPM
  private stepIndex = 0;
  private intervalId: number | null = null;
  private playMode: 'simultaneous' | 'sequential' = 'simultaneous';
  
  // Kick drum related properties
  private kickEnabled = false;
  private kickGain = 0.7;
  private kickOscillator: OscillatorNode | null = null;
  private kickGainNode: GainNode | null = null;
  
  // Acid bass notes frequencies (A minor scale)
  private notes: number[] = [
    110.00, // A2
    123.47, // B2
    130.81, // C3
    146.83, // D3
    164.81, // E3
    174.61, // F3
    196.00, // G3
    220.00, // A3
  ];
  
  // Callback for visual update
  private onStepCallback: ((step: number) => void) | null = null;
  
  constructor() {
    // Initialize empty sequence (16 steps with empty arrays)
    this.sequence = Array(16).fill(0).map(() => []);
  }
  
  public init(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Pre-create a small pool of oscillators for performance
      for (let i = 0; i < 8; i++) {
        this.createOscillator();
      }
      
      // Initialize kick drum
      this.initKickDrum();
      
    } catch (error) {
      console.error("Web Audio API not supported:", error);
    }
  }
  
  private initKickDrum(): void {
    if (!this.audioContext) return;
    
    // Create oscillator and gain node for kick drum
    this.kickOscillator = this.audioContext.createOscillator();
    this.kickGainNode = this.audioContext.createGain();
    
    // Set kick drum properties
    this.kickOscillator.type = 'sine';
    this.kickGainNode.gain.value = 0; // Start silent
    
    // Connect nodes
    this.kickOscillator.connect(this.kickGainNode);
    this.kickGainNode.connect(this.audioContext.destination);
    
    // Start oscillator (will be silent until triggered)
    this.kickOscillator.start();
  }
  
  private triggerKick(time: number): void {
    if (!this.audioContext || !this.kickOscillator || !this.kickGainNode || !this.kickEnabled) return;
    
    // Create frequency sweep (from 150Hz to 40Hz)
    this.kickOscillator.frequency.setValueAtTime(150, time);
    this.kickOscillator.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    
    // Create volume envelope
    this.kickGainNode.gain.setValueAtTime(this.kickGain, time);
    this.kickGainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
  }
  
  public setKickEnabled(enabled: boolean): void {
    this.kickEnabled = enabled;
  }
  
  public setKickGain(gain: number): void {
    this.kickGain = gain;
  }
  
  private createOscillator(): void {
    if (!this.audioContext) return;
    
    // Create basic synthesizer components
    const oscillator = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    const gain = this.audioContext.createGain();
    
    // Set initial properties
    oscillator.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    filter.Q.value = 15; // Resonance
    gain.gain.value = 0.0; // Start silent
    
    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    // Start oscillator (will be silent until gain is adjusted)
    oscillator.start();
    
    // Add to our arrays
    this.oscillators.push(oscillator);
    this.filters.push(filter);
    this.gains.push(gain);
  }
  
  public setSequence(sequence: number[][]): void {
    this.sequence = sequence;
  }
  
  public setTempo(bpm: number): void {
    this.tempo = bpm;
    
    // If playing, restart the sequence with new tempo
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  }
  
  public setPlayMode(mode: 'simultaneous' | 'sequential'): void {
    this.playMode = mode;
  }
  
  public setRowCount(rows: number): void {
    // Update notes array based on the row count
    // This is a simplified approach - in a real synth you might want more control over the note range
    this.notes = [];
    
    // Generate note frequencies
    const baseNotes = [110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00, 220.00]; // A2 to A3
    const baseLength = baseNotes.length;
    
    // Fill with enough notes for all rows
    for (let i = 0; i < rows; i++) {
      const octaveMultiplier = Math.floor(i / baseLength);
      const noteIndex = i % baseLength;
      // Calculate frequency with octave shift (multiply by 2 for each octave)
      this.notes.push(baseNotes[noteIndex] * Math.pow(2, octaveMultiplier));
    }
    
    // Reverse so highest notes are at the top
    this.notes.reverse();
  }
  
  public setOnStepCallback(callback: (step: number) => void): void {
    this.onStepCallback = callback;
  }
  
  public play(): void {
    if (!this.audioContext || this.isPlaying) return;
    
    // Resume audio context if it was suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.isPlaying = true;
    this.stepIndex = 0;
    
    // Calculate step duration based on tempo
    const stepDuration = (60 / this.tempo) * 1000 / 4; // 16th notes
    
    // Start the sequencer loop
    this.intervalId = window.setInterval(() => this.playStep(), stepDuration);
  }
  
  public stop(): void {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Silence all oscillators
    this.gains.forEach(gain => {
      if (gain && gain.gain.setValueAtTime && this.audioContext) {
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      }
    });
    
    // Reset step counter and update UI
    this.stepIndex = 0;
    if (this.onStepCallback) {
      this.onStepCallback(-1);
    }
  }
  
  private playStep(): void {
    if (!this.audioContext) return;
    
    const currentTime = this.audioContext.currentTime;
    
    // Get the notes for the current step
    const stepNotes = this.sequence[this.stepIndex];
    
    // Make sure we have enough oscillators for all notes
    while (this.oscillators.length < stepNotes.length) {
      this.createOscillator();
    }
    
    // First, silence all oscillators
    this.gains.forEach(gain => {
      gain.gain.setValueAtTime(0, currentTime);
    });
    
    // Play notes according to the mode
    if (this.playMode === 'simultaneous') {
      // Play all notes at once (original behavior)
      stepNotes.forEach((noteIndex, i) => {
        if (i < this.oscillators.length && noteIndex >= 0 && noteIndex < this.notes.length) {
          // Set oscillator frequency to the selected note
          this.oscillators[i].frequency.setValueAtTime(this.notes[noteIndex], currentTime);
          
          // Characteristic acid filter sweep
          this.filters[i].frequency.setValueAtTime(500, currentTime);
          this.filters[i].frequency.linearRampToValueAtTime(3000, currentTime + 0.05);
          this.filters[i].frequency.exponentialRampToValueAtTime(500, currentTime + 0.2);
          
          // Attack-release envelope
          this.gains[i].gain.setValueAtTime(0, currentTime);
          this.gains[i].gain.linearRampToValueAtTime(0.3, currentTime + 0.02); // Attack
          this.gains[i].gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2); // Release
        }
      });
    } else {
      // Sequential mode: play notes one by one with a small delay
      stepNotes.forEach((noteIndex, i) => {
        if (i < this.oscillators.length && noteIndex >= 0 && noteIndex < this.notes.length) {
          // Add a small delay for each note
          const noteDelay = i * 0.05;
          const noteTime = currentTime + noteDelay;
          
          // Set oscillator frequency
          this.oscillators[i].frequency.setValueAtTime(this.notes[noteIndex], noteTime);
          
          // Acid filter sweep
          this.filters[i].frequency.setValueAtTime(500, noteTime);
          this.filters[i].frequency.linearRampToValueAtTime(3000, noteTime + 0.05);
          this.filters[i].frequency.exponentialRampToValueAtTime(500, noteTime + 0.2);
          
          // Attack-release envelope
          this.gains[i].gain.setValueAtTime(0, noteTime);
          this.gains[i].gain.linearRampToValueAtTime(0.3, noteTime + 0.02);
          this.gains[i].gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);
        }
      });
    }
    
    // Trigger kick drum on every 4th step (downbeat)
    if (this.stepIndex % 4 === 0) {
      this.triggerKick(currentTime);
    }
    
    // Call step callback for UI update
    if (this.onStepCallback) {
      this.onStepCallback(this.stepIndex);
    }
    
    // Move to next step
    this.stepIndex = (this.stepIndex + 1) % this.sequence.length;
  }
  
  public cleanup(): void {
    this.stop();
    
    // Clean up all audio nodes
    this.oscillators.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    
    this.filters.forEach(filter => {
      filter.disconnect();
    });
    
    this.gains.forEach(gain => {
      gain.disconnect();
    });
    
    // Clean up kick drum
    if (this.kickOscillator) {
      this.kickOscillator.stop();
      this.kickOscillator.disconnect();
    }
    
    if (this.kickGainNode) {
      this.kickGainNode.disconnect();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    // Clear arrays
    this.oscillators = [];
    this.filters = [];
    this.gains = [];
  }
}

export default AudioEngine;
