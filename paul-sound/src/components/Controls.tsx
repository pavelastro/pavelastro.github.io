
import React from 'react';
import { Play, Square, RefreshCcw, Shuffle, Drum } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ControlsProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  tempo: number;
  onTempoChange: (tempo: number) => void;
  onClear: () => void;
  onRandomize: () => void;
  rows: number;
  onRowsChange: (rows: number) => void;
  columns: number;
  onColumnsChange: (columns: number) => void;
  playMode: 'simultaneous' | 'sequential';
  onPlayModeChange: (mode: 'simultaneous' | 'sequential') => void;
  kickEnabled: boolean;
  onKickEnabledChange: (enabled: boolean) => void;
  kickGain: number;
  onKickGainChange: (gain: number) => void;
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onPlayToggle,
  tempo,
  onTempoChange,
  onClear,
  onRandomize,
  rows,
  onRowsChange,
  columns,
  onColumnsChange,
  playMode,
  onPlayModeChange,
  kickEnabled,
  onKickEnabledChange,
  kickGain,
  onKickGainChange
}) => {
  return (
    <div className="controls flex flex-wrap items-center gap-4 py-4">
      <button
        onClick={onPlayToggle}
        className={`control-button flex items-center gap-2 ${isPlaying ? 'active' : ''}`}
        aria-label={isPlaying ? 'Stop' : 'Play'}
      >
        {isPlaying ? (
          <>
            <Square size={16} /> Stop
          </>
        ) : (
          <>
            <Play size={16} /> Play
          </>
        )}
      </button>
      
      <div className="flex items-center gap-2">
        <label htmlFor="tempo" className="text-acid-neon text-sm">
          BPM:
        </label>
        <input
          id="tempo"
          type="range"
          min="60"
          max="200"
          step="1"
          value={tempo}
          onChange={(e) => onTempoChange(parseInt(e.target.value))}
          className="w-32 accent-acid-neon"
        />
        <span className="text-white min-w-12 text-center">{tempo}</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2">
          <label className="text-acid-neon text-sm mr-2">Rows:</label>
          <Select value={rows.toString()} onValueChange={(value) => onRowsChange(parseInt(value))}>
            <SelectTrigger className="h-9 w-20 bg-black border-acid-neon text-acid-neon">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent className="bg-black border-acid-neon text-acid-neon">
              {[4, 8, 12, 16].map((value) => (
                <SelectItem key={value} value={value.toString()} className="focus:bg-acid-neon/20">
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-acid-neon text-sm mr-2">Columns:</label>
          <Select value={columns.toString()} onValueChange={(value) => onColumnsChange(parseInt(value))}>
            <SelectTrigger className="h-9 w-20 bg-black border-acid-neon text-acid-neon">
              <SelectValue placeholder="Columns" />
            </SelectTrigger>
            <SelectContent className="bg-black border-acid-neon text-acid-neon">
              {[8, 16, 24, 32].map((value) => (
                <SelectItem key={value} value={value.toString()} className="focus:bg-acid-neon/20">
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-acid-neon text-sm mr-2">Play Mode:</label>
          <Select value={playMode} onValueChange={(value) => onPlayModeChange(value as 'simultaneous' | 'sequential')}>
            <SelectTrigger className="h-9 w-32 bg-black border-acid-neon text-acid-neon">
              <SelectValue placeholder="Play Mode" />
            </SelectTrigger>
            <SelectContent className="bg-black border-acid-neon text-acid-neon">
              <SelectItem value="simultaneous" className="focus:bg-acid-neon/20">All at once</SelectItem>
              <SelectItem value="sequential" className="focus:bg-acid-neon/20">Row by row</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Kick drum controls */}
      <div className="flex items-center gap-4 ml-4 border-l border-acid-grid pl-4">
        <div className="flex items-center gap-2">
          <Drum size={18} className="text-acid-neon" />
          <Label htmlFor="kick-toggle" className="text-acid-neon text-sm">Kick</Label>
          <Switch 
            id="kick-toggle" 
            checked={kickEnabled} 
            onCheckedChange={onKickEnabledChange}
            className="data-[state=checked]:bg-acid-neon"
          />
        </div>
        
        {kickEnabled && (
          <div className="flex items-center gap-2">
            <Label htmlFor="kick-gain" className="text-acid-neon text-sm">Gain:</Label>
            <Slider 
              id="kick-gain"
              value={[kickGain]} 
              onValueChange={([value]) => onKickGainChange(value)}
              min={0}
              max={1}
              step={0.01}
              className="w-24"
            />
            <span className="text-white min-w-8 text-center text-xs">
              {Math.round(kickGain * 100)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onRandomize}
          className="control-button flex items-center gap-2"
          aria-label="Randomize pattern"
        >
          <Shuffle size={16} /> Randomize
        </button>
        
        <button
          onClick={onClear}
          className="control-button flex items-center gap-2"
          aria-label="Clear pattern"
        >
          <RefreshCcw size={16} /> Clear
        </button>
      </div>
    </div>
  );
};

export default Controls;
