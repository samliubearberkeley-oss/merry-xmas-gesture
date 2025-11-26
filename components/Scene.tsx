import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Ornaments } from './Ornaments';
import { Foliage } from './Foliage';
import { TreeTopper } from './TreeTopper';
import { TreeMode } from '../types';

interface SceneProps {
  mode: TreeMode;
}

export const Scene: React.FC<SceneProps> = ({ mode }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, toneMapping: 3 }} // ACESFilmic
      className="w-full h-full"
    >
      <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2}
        maxDistance={40}
        minDistance={10}
        autoRotate={mode === 'FORMED'}
        autoRotateSpeed={0.5}
      />

      {/* Lighting: Warmer dramatic lighting - Boosted Intensity */}
      <ambientLight intensity={0.6} color="#443311" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={300} 
        color="#FFF5E6" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={80} color="#FFD700" />

      {/* Environment Reflections */}
      <Suspense fallback={null}>
        <Environment preset="lobby" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <group position={[0, -5, 0]}>
            <Foliage mode={mode} />
            <Ornaments mode={mode} />
            <TreeTopper mode={mode} />
        </group>
      </Suspense>

      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};