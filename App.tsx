import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { TreeMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<TreeMode>('CHAOS');

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene mode={mode} />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none p-8 md:p-12">
        {/* Controls positioned at bottom right */}
        <div className="absolute bottom-12 right-12 pointer-events-auto">
            <div className="flex space-x-6 bg-black/40 backdrop-blur-md p-3 rounded-full border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <button
                    onClick={() => setMode('CHAOS')}
                    className={`
                        font-serif tracking-widest px-6 py-2 rounded-full transition-all duration-500 border text-sm
                        ${mode === 'CHAOS' 
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_20px_#D4AF37]' 
                            : 'bg-transparent text-[#D4AF37] border-[#D4AF37]/50 hover:bg-[#D4AF37]/10'
                        }
                    `}
                >
                    CHAOS
                </button>
                <button
                    onClick={() => setMode('FORMED')}
                    className={`
                        font-serif tracking-widest px-6 py-2 rounded-full transition-all duration-500 border text-sm
                        ${mode === 'FORMED' 
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_20px_#D4AF37]' 
                            : 'bg-transparent text-[#D4AF37] border-[#D4AF37]/50 hover:bg-[#D4AF37]/10'
                        }
                    `}
                >
                    FORMED
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
