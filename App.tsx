import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scene } from './components/Scene';
import { HandSkeleton } from './components/HandSkeleton';
import { ControlPanel } from './components/ControlPanel';
import { useHandTracking, GestureState } from './hooks/useHandTracking';
import { TreeMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<TreeMode>('CHAOS');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [controls, setControls] = useState({
    spin: 0.2,
    scale: 1.1,
    density: 4.298,
    distortion: 0.008,
    fieldRadius: 22.59,
    showSkeleton: true,
    handTrackingEnabled: true, // Hand tracking toggle
  });

  const { handData, stats } = useHandTracking(videoRef, controls.handTrackingEnabled);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gesture to mode mapping
  useEffect(() => {
    if (!handData.isTracking) return;

    if (handData.gesture === 'FIST' || handData.gesture === 'PINCH') {
      setMode('FORMED');
    } else {
      setMode('CHAOS');
    }
  }, [handData.gesture, handData.isTracking]);

  const handleControlChange = useCallback((key: string, value: number | boolean) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  }, []);

  const projectionMap: Record<GestureState, string> = {
    OPEN: 'C', // Chaos
    PINCH: 'P', // Pinch
    FIST: 'F', // Formed/Fist
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Camera video (semi-transparent background) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        style={{ transform: 'scaleX(-1)' }}
        autoPlay
        playsInline
        muted
      />

      {/* Grid background effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Hand skeleton visualization */}
      {controls.showSkeleton && (
        <HandSkeleton
          landmarks={handData.landmarks}
          width={windowSize.width}
          height={windowSize.height}
        />
      )}

      {/* 3D particle scene */}
      <div className="absolute inset-0 z-10">
        <Scene
          mode={mode}
          handPosition={handData.palmCenter}
          isTracking={handData.isTracking}
        />
      </div>

      {/* HUD control panel */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <ControlPanel
            currentProjection={projectionMap[handData.gesture]}
            gesture={handData.gesture}
            isTracking={handData.isTracking}
            stats={stats}
            onNextForm={() => setMode(mode === 'CHAOS' ? 'FORMED' : 'CHAOS')}
            controls={controls}
            onControlChange={handleControlChange}
          />
        </div>
      </div>

      {/* Current mode indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className={`
          px-8 py-3 backdrop-blur-md rounded-full border transition-all duration-500
          ${mode === 'FORMED' 
            ? 'bg-green-900/30 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]' 
            : 'bg-red-900/30 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
          }
        `}>
          <span className="font-mono text-sm tracking-widest text-white/90 flex items-center gap-3">
            <span className={`text-xl ${mode === 'FORMED' ? 'animate-pulse' : ''}`}>
              {mode === 'FORMED' ? '✊' : '🖐️'}
            </span>
            <span className="font-bold">{mode}</span>
            {!handData.isTracking && (
              <span className="text-yellow-400 text-xs animate-pulse">• Waiting</span>
            )}
          </span>
        </div>
      </div>

      {/* Hint overlay */}
      {!handData.isTracking && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm px-8 py-6 rounded-xl border border-white/10">
            <div className="text-4xl mb-4 animate-bounce">👋</div>
            <div className="text-white/80 font-mono text-sm tracking-wider">
              Place your hand in camera view
            </div>
            <div className="text-white/50 font-mono text-xs mt-2">
              Fist = FORMED | Open = CHAOS
            </div>
          </div>
        </div>
      )}

      {/* Made by credit */}
      <a
        href="https://x.com/real_SamLiu"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-8 right-8 z-30 group"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-black/60">
          <span className="text-white/50 font-mono text-xs tracking-wider group-hover:text-white/80 transition-colors">
            made by
          </span>
          <span className="text-white/90 font-mono text-sm font-bold group-hover:text-red-400 transition-colors">
            Sam Liu
          </span>
          <svg
            className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
      </a>
    </div>
  );
};

export default App;
