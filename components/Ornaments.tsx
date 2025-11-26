import React, { useLayoutEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrnamentData } from '../types';

interface OrnamentGroupProps {
  mode: 'CHAOS' | 'FORMED';
}

// Reusable temporary object for matrix operations
const tempObject = new THREE.Object3D();

// Ornament counts
const ORNAMENT_COUNTS = {
  ball: 400,
  box: 150,
  light: 600,
  cascade: 300,
  gem: 200,
  bell: 150,
} as const;

// Color palettes
const COLOR_PALETTES = {
  luxury: [
    "#FFD700", // Bright Gold
    "#DC143C", // Crimson
    "#B22222", // Firebrick
    "#E5AA70", // Polished Copper
    "#FF8C00", // Dark Orange
    "#D2691E", // Chocolate
  ],
  light: [
    "#FFD700", // Gold
    "#FFA500", // Orange
    "#FFB347", // Pastel Orange
    "#FFCC00", // Tangerine Yellow
  ],
  cascade: [
    "#FFD700", // Gold
    "#FFC125", // Goldenrod
    "#FFAA00", // Amber
    "#FFDEAD", // Navajo White (Warmest white)
  ],
  gem: [
    "#1E90FF", // Dodger Blue
    "#32CD32", // Lime Green
    "#C71585", // Medium Violet Red
    "#FFD700", // Gold
    "#9400D3", // Dark Violet
  ],
  bell: [
    "#FFD700", // Gold
    "#CD7F32", // Bronze
    "#DAA520", // Goldenrod
  ],
} as const;

// Tree dimensions
const TREE_HEIGHT = 16;
const TREE_BASE_RADIUS = 5.5;
const TREE_HEIGHT_OFFSET = -8;

// Animation constants
const CASCADE_ANIMATION = {
  speed: 2.5,
  heightSpan: 16,
  offsetMultiplier: 13.37,
} as const;

export const Ornaments: React.FC<OrnamentGroupProps> = ({ mode }) => {
  const ballMeshRef = useRef<THREE.InstancedMesh>(null);
  const boxMeshRef = useRef<THREE.InstancedMesh>(null);
  const lightMeshRef = useRef<THREE.InstancedMesh>(null);
  const cascadeMeshRef = useRef<THREE.InstancedMesh>(null);
  const gemMeshRef = useRef<THREE.InstancedMesh>(null);
  const bellMeshRef = useRef<THREE.InstancedMesh>(null);

  // Generate ornament data
  const { balls, boxes, lights, cascades, gems, bells } = useMemo(() => {
    const _balls: OrnamentData[] = [];
    const _boxes: OrnamentData[] = [];
    const _lights: OrnamentData[] = [];
    const _cascades: OrnamentData[] = [];
    const _gems: OrnamentData[] = [];
    const _bells: OrnamentData[] = [];

    // Radius offsets for different ornament types on tree surface
    const radiusOffsets: Record<OrnamentData['type'], number> = {
      box: 0.5,
      ball: 0.2,
      light: -0.1,
      cascade: 0.05,
      gem: 0.4,
      bell: 0.3,
    };

    const generatePosition = (type: OrnamentData['type']) => {
      // Chaos state: Random positions in a sphere
      const rC = 25 * Math.cbrt(Math.random());
      const thetaC = Math.random() * 2 * Math.PI;
      const phiC = Math.acos(2 * Math.random() - 1);
      const chaos = new THREE.Vector3(
        rC * Math.sin(phiC) * Math.cos(thetaC),
        rC * Math.sin(phiC) * Math.sin(thetaC) + 5,
        rC * Math.cos(phiC)
      );

      // Formed state: Positions on tree surface (cone)
      const yRaw = Math.random() * TREE_HEIGHT * 0.9;
      const y = yRaw + TREE_HEIGHT_OFFSET;
      const rAtY = TREE_BASE_RADIUS * (1 - yRaw / TREE_HEIGHT);
      const angle = Math.random() * Math.PI * 2;
      const rFinal = rAtY + radiusOffsets[type];

      const target = new THREE.Vector3(
        rFinal * Math.cos(angle),
        y,
        rFinal * Math.sin(angle)
      );

      return { chaos, target, angle };
    };

    const getRandomColor = (palette: readonly string[]) =>
      palette[Math.floor(Math.random() * palette.length)];

    // Generate balls
    for (let i = 0; i < ORNAMENT_COUNTS.ball; i++) {
      const { chaos, target } = generatePosition('ball');
      _balls.push({
        id: `ball-${i}`,
        chaosPos: chaos,
        targetPos: target,
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          0
        ),
        color: getRandomColor(COLOR_PALETTES.luxury),
        type: 'ball',
        scale: Math.random() * 0.2 + 0.15,
      });
    }

    // Generate boxes
    for (let i = 0; i < ORNAMENT_COUNTS.box; i++) {
      const { chaos, target } = generatePosition('box');
      // Boxes positioned lower and wider
      target.y = Math.random() * 4 - 8;
      target.x *= 1.5;
      target.z *= 1.5;

      _boxes.push({
        id: `box-${i}`,
        chaosPos: chaos,
        targetPos: target,
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          0
        ),
        color: getRandomColor(COLOR_PALETTES.luxury),
        type: 'box',
        scale: Math.random() * 0.4 + 0.2,
      });
    }

    // Generate lights
    for (let i = 0; i < ORNAMENT_COUNTS.light; i++) {
      const { chaos, target } = generatePosition('light');
      _lights.push({
        id: `light-${i}`,
        chaosPos: chaos,
        targetPos: target,
        rotation: new THREE.Euler(0, 0, 0),
        color: getRandomColor(COLOR_PALETTES.light),
        type: 'light',
        scale: Math.random() * 0.08 + 0.05,
      });
    }

    // Generate cascades
    for (let i = 0; i < ORNAMENT_COUNTS.cascade; i++) {
      const { chaos, target, angle } = generatePosition('cascade');
      _cascades.push({
        id: `cascade-${i}`,
        chaosPos: chaos,
        targetPos: target,
        rotation: new THREE.Euler(0, 0, 0),
        color: getRandomColor(COLOR_PALETTES.cascade),
        type: 'cascade',
        scale: Math.random() * 0.06 + 0.03,
        initialAngle: angle,
      });
    }

    // Generate gems
    for (let i = 0; i < ORNAMENT_COUNTS.gem; i++) {
      const { chaos, target } = generatePosition('gem');
      _gems.push({
        id: `gem-${i}`,
        chaosPos: chaos,
        targetPos: target,
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          0
        ),
        color: getRandomColor(COLOR_PALETTES.gem),
        type: 'gem',
        scale: Math.random() * 0.25 + 0.15,
      });
    }

    // Generate bells
    for (let i = 0; i < ORNAMENT_COUNTS.bell; i++) {
      const { chaos, target } = generatePosition('bell');
      _bells.push({
        id: `bell-${i}`,
        chaosPos: chaos,
        targetPos: target,
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
        color: getRandomColor(COLOR_PALETTES.bell),
        type: 'bell',
        scale: Math.random() * 0.3 + 0.2,
      });
    }

    return {
      balls: _balls,
      boxes: _boxes,
      lights: _lights,
      cascades: _cascades,
      gems: _gems,
      bells: _bells,
    };
  }, []);

  // Animation loop
  useFrame((state) => {
    const isFormed = mode === 'FORMED';
    const time = state.clock.elapsedTime;

    // Calculate cascade position for flowing animation
    const getCascadePosition = (
      initialAngle: number,
      index: number
    ): THREE.Vector3 => {
      const offset = index * CASCADE_ANIMATION.offsetMultiplier;
      const yOffset =
        (time * CASCADE_ANIMATION.speed + offset) %
        CASCADE_ANIMATION.heightSpan;
      const currentY = 8 - yOffset;
      const yFromBase = currentY + 8;
      const r = TREE_BASE_RADIUS * (1 - yFromBase / TREE_HEIGHT);

      return new THREE.Vector3(
        r * Math.cos(initialAngle),
        currentY,
        r * Math.sin(initialAngle)
      );
    };

    const updateMesh = (
      ref: React.RefObject<THREE.InstancedMesh>,
      dataArr: OrnamentData[],
      speedFormed: number,
      speedChaos: number,
      rotate: boolean = true
    ) => {
      if (!ref.current) return;

      dataArr.forEach((data, i) => {
        // Determine destination position
        let dest = data.targetPos;
        if (data.type === 'cascade' && isFormed && data.initialAngle !== undefined) {
          dest = getCascadePosition(data.initialAngle, i);
        } else if (!isFormed) {
          dest = data.chaosPos;
        }

        // Get current matrix and decompose
        ref.current!.getMatrixAt(i, tempObject.matrix);
        tempObject.matrix.decompose(
          tempObject.position,
          tempObject.quaternion,
          tempObject.scale
        );

        // Interpolate position
        const lerpSpeed =
          data.type === 'cascade' && isFormed
            ? 0.1
            : isFormed
            ? speedFormed
            : speedChaos;
        tempObject.position.lerp(dest, lerpSpeed);

        // Handle rotation
        if (rotate) {
          if (data.type === 'bell' && isFormed) {
            // Swinging animation for bells
            tempObject.rotation.copy(data.rotation);
            const swingAngle = Math.sin(time * 3 + i) * 0.2;
            tempObject.rotation.z += swingAngle;
            tempObject.rotation.x += Math.cos(time * 2 + i) * 0.1;
          } else if (data.type === 'gem') {
            // Slow, elegant rotation for gems
            tempObject.rotation.x += 0.005;
            tempObject.rotation.y += 0.01;
            tempObject.rotation.z += 0.005;
          } else {
            // General rotation
            tempObject.rotation.x += 0.01;
            tempObject.rotation.y += 0.01;
          }
        }

        // Handle scale animations
        if (data.type === 'light') {
          // Pulsing lights
          const pulse = Math.sin(time * 3 + i * 0.1) * 0.3;
          tempObject.scale.setScalar(data.scale * (1 + pulse));
        } else if (data.type === 'cascade') {
          // Twinkling cascades
          const twinkle = Math.sin(time * 15 + i * 20);
          const scaleMultiplier =
            twinkle > 0.8 ? 1.5 : twinkle < -0.5 ? 0.2 : 0.8;
          tempObject.scale.setScalar(data.scale * scaleMultiplier);
        } else {
          tempObject.scale.setScalar(data.scale);
        }

        // Update matrix
        tempObject.updateMatrix();
        ref.current!.setMatrixAt(i, tempObject.matrix);
      });

      ref.current.instanceMatrix.needsUpdate = true;
    };

    // Update all meshes
    updateMesh(ballMeshRef, balls, 0.03, 0.01);
    updateMesh(boxMeshRef, boxes, 0.02, 0.005);
    updateMesh(lightMeshRef, lights, 0.08, 0.04, false);
    updateMesh(cascadeMeshRef, cascades, 0.1, 0.04, false);
    updateMesh(gemMeshRef, gems, 0.02, 0.005);
    updateMesh(bellMeshRef, bells, 0.025, 0.01, true);
  });

  // Initialize meshes with colors and positions
  useLayoutEffect(() => {
    const initMesh = (
      ref: React.RefObject<THREE.InstancedMesh>,
      dataArr: OrnamentData[]
    ) => {
      if (!ref.current) return;

      dataArr.forEach((data, i) => {
        // Set per-instance color
        const color = new THREE.Color(data.color);
        ref.current!.setColorAt(i, color);

        // Set initial position and scale
        tempObject.position.copy(data.chaosPos);
        tempObject.scale.setScalar(data.scale);
        tempObject.rotation.copy(data.rotation);
        tempObject.updateMatrix();
        ref.current!.setMatrixAt(i, tempObject.matrix);
      });

      // Update instance color buffer if available
      if (ref.current.instanceColor) {
        ref.current.instanceColor.needsUpdate = true;
      }
    };

    initMesh(ballMeshRef, balls);
    initMesh(boxMeshRef, boxes);
    initMesh(lightMeshRef, lights);
    initMesh(cascadeMeshRef, cascades);
    initMesh(gemMeshRef, gems);
    initMesh(bellMeshRef, bells);
  }, [balls, boxes, lights, cascades, gems, bells]);

  return (
    <group>
      {/* Glossy Balls */}
      <instancedMesh ref={ballMeshRef} args={[undefined, undefined, ORNAMENT_COUNTS.ball]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={3.0}
          color="#FFD700"
        />
      </instancedMesh>

      {/* Gift Boxes */}
      <instancedMesh ref={boxMeshRef} args={[undefined, undefined, ORNAMENT_COUNTS.box]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          metalness={0.6}
          roughness={0.2}
          envMapIntensity={2.0}
          emissive="#330000"
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* Faceted Gems */}
      <instancedMesh ref={gemMeshRef} args={[undefined, undefined, ORNAMENT_COUNTS.gem]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          flatShading
          metalness={0.9}
          roughness={0.0}
          envMapIntensity={3.5}
        />
      </instancedMesh>

      {/* Sparkling Bells */}
      <instancedMesh ref={bellMeshRef} args={[undefined, undefined, ORNAMENT_COUNTS.bell]}>
        <cylinderGeometry args={[0.05, 0.35, 0.5, 16]} />
        <meshStandardMaterial
          metalness={0.95}
          roughness={0.1}
          envMapIntensity={3.0}
        />
      </instancedMesh>

      {/* Fairy Lights */}
      <instancedMesh ref={lightMeshRef} args={[undefined, undefined, ORNAMENT_COUNTS.light]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial toneMapped={false} color="#FFFFFF" />
      </instancedMesh>

      {/* Cascade Lights */}
      <instancedMesh ref={cascadeMeshRef} args={[undefined, undefined, ORNAMENT_COUNTS.cascade]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
};
