import React from 'react';
import { GestureState, HandTrackingStats } from '../hooks/useHandTracking';

interface ControlPanelProps {
  currentProjection: string;
  gesture: GestureState;
  isTracking: boolean;
  stats: HandTrackingStats;
  onNextForm: () => void;
  controls: {
    spin: number;
    scale: number;
    density: number;
    distortion: number;
    fieldRadius: number;
    showSkeleton: boolean;
    handTrackingEnabled: boolean;
  };
  onControlChange: (key: string, value: number | boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  currentProjection,
  gesture,
  isTracking,
  stats,
  onNextForm,
  controls,
  onControlChange,
}) => {
  return (
    <div className="font-mono text-[11px] text-white/90 select-none">
      {/* Left panel */}
      <div className="absolute top-8 left-8 space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider">XMAS</h1>
          <h2 className="text-sm text-white/60 tracking-widest">ARCHITECT</h2>
        </div>

        <div className="space-y-1">
          <div className="text-white/50 text-[9px] tracking-widest">CURRENT PROJECTION</div>
          <div className="text-base tracking-widest text-red-400 font-bold">
            MAGIC '{currentProjection}'
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-white/50 text-[9px] tracking-widest">SYSTEM STATUS</div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-red-400'}`} />
            <span className="text-white/80">CAM FEED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-yellow-400'}`} />
            <span className="text-white/80">HAND TRACK</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${gesture === 'PINCH' ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-white/20'}`} />
            <span className="text-white/80">PINCH LOCK</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${gesture === 'FIST' ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-white/20'}`} />
            <span className="text-white/80">FIST MORPH</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="text-white/50 text-[9px] tracking-widest">REAL-TIME DATA</div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <div className="text-white/50 text-[9px]">PARTICLES</div>
              <div className="text-lg font-bold">{stats.particleCount}</div>
            </div>
            <div>
              <div className="text-white/50 text-[9px]">FPS</div>
              <div className="text-lg font-bold">{stats.fps}</div>
            </div>
            <div>
              <div className="text-white/50 text-[9px]">TIME</div>
              <div className="font-mono">{stats.elapsedTime}</div>
            </div>
            <div>
              <div className="text-white/50 text-[9px]">STREAM</div>
              <div className="font-mono">{stats.streamRate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right control panel */}
      <div className="absolute top-8 right-8 w-52 space-y-3 bg-black/50 backdrop-blur-sm p-4 rounded border border-white/10">
        <div className="text-white/50 text-[9px] tracking-widest">CONTROLS</div>

        <div className="space-y-3">
          <div className="text-white/50 text-[9px] tracking-widest">PROJECTION</div>
          {[
            { label: 'Spin', key: 'spin', max: 1 },
            { label: 'Scale', key: 'scale', max: 2 },
            { label: 'Density', key: 'density', max: 10 },
            { label: 'Distortion', key: 'distortion', max: 0.1 },
          ].map(({ label, key, max }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <span className="text-white/70 text-[10px]">{label}</span>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(controls[key as keyof typeof controls] as number / max) * 100}
                  onChange={(e) =>
                    onControlChange(key, (parseFloat(e.target.value) / 100) * max)
                  }
                  className="w-20 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-red-500"
                />
                <span className="w-10 text-right text-[10px] text-white/60">
                  {(controls[key as keyof typeof controls] as number).toFixed(3)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="text-white/50 text-[9px] tracking-widest">SENSOR</div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-[10px]">Field Radius</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={controls.fieldRadius}
                onChange={(e) => onControlChange('fieldRadius', parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-red-500"
              />
              <span className="w-10 text-right text-[10px] text-white/60">
                {controls.fieldRadius.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-[10px]">Hand Tracking</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={controls.handTrackingEnabled}
                onChange={(e) => onControlChange('handTrackingEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500/60"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-[10px]">HUD Skeleton</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={controls.showSkeleton}
                onChange={(e) => onControlChange('showSkeleton', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500/60"></div>
            </label>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10">
          <div className="text-white/50 text-[9px] tracking-widest mb-2">SYSTEM</div>
          <button
            onClick={onNextForm}
            className="w-full py-2 bg-white/5 hover:bg-white/15 border border-white/20 hover:border-white/40 rounded text-[10px] tracking-widest transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="text-white/60">&gt;&gt;</span>
            <span>NEXT FORM</span>
            <span className="animate-pulse">⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};

