import * as THREE from 'three';

export type TreeMode = 'CHAOS' | 'FORMED';

export interface ParticleData {
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  color: THREE.Color;
  size: number;
}

export interface OrnamentData {
  id: string;
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  rotation: THREE.Euler;
  color: string;
  type: 'box' | 'ball' | 'light' | 'cascade' | 'gem' | 'bell';
  scale: number;
  initialAngle?: number; // Used for cascade positioning logic
}



