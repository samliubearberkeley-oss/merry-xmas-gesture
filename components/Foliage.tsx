import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface FoliageProps {
  mode: "CHAOS" | "FORMED";
}

export const Foliage: React.FC<FoliageProps> = ({ mode }) => {
  const count = 250; // 减少树叶数量
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry, chaosPositions, targetPositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const chaos = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // 与 Ornaments 完全一致的锥体参数
    const TREE_HEIGHT = 16;
    const TREE_BASE_RADIUS = 5.5;
    const TREE_HEIGHT_OFFSET = -8;

    // 鲜艳的绿色调色板
    const palette = [
      new THREE.Color("#2E7D32"),
      new THREE.Color("#388E3C"),
      new THREE.Color("#43A047"),
      new THREE.Color("#4CAF50"),
      new THREE.Color("#66BB6A"),
      new THREE.Color("#1B5E20"),
    ];

    for (let i = 0; i < count; i++) {
      // --- TARGET (FORMED) STATE ---
      const yRaw = Math.pow(Math.random(), 0.8) * TREE_HEIGHT * 0.92;
      const ty = yRaw + TREE_HEIGHT_OFFSET;
      const maxRadiusAtY = TREE_BASE_RADIUS * (1 - yRaw / TREE_HEIGHT);
      const rFill = maxRadiusAtY * Math.sqrt(Math.random()) * 0.95;
      const angle = Math.random() * Math.PI * 2;

      const tx = rFill * Math.cos(angle);
      const tz = rFill * Math.sin(angle);

      target[i * 3] = tx;
      target[i * 3 + 1] = ty;
      target[i * 3 + 2] = tz;

      // --- CHAOS STATE ---
      const chaosRadius = 20;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const cr = chaosRadius * Math.cbrt(Math.random());

      chaos[i * 3] = cr * Math.sin(phi) * Math.cos(theta);
      chaos[i * 3 + 1] = cr * Math.sin(phi) * Math.sin(theta) + 5;
      chaos[i * 3 + 2] = cr * Math.cos(phi);

      // 初始位置 = chaos
      positions[i * 3] = chaos[i * 3];
      positions[i * 3 + 1] = chaos[i * 3 + 1];
      positions[i * 3 + 2] = chaos[i * 3 + 2];

      // --- COLOR ---
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      // --- SIZE ---
      sizes[i] = Math.random() * 1.5 + 0.8;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    return { 
      geometry: geo, 
      chaosPositions: chaos, 
      targetPositions: target 
    };
  }, []);

  // 动画：在 chaos 和 target 之间插值
  const progressRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    const targetProgress = mode === "FORMED" ? 1.0 : 0.0;
    progressRef.current = THREE.MathUtils.lerp(
      progressRef.current,
      targetProgress,
      delta * 2.5
    );

    // 更新位置
    const positions = geometry.attributes.position.array as Float32Array;
    const t = progressRef.current;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = THREE.MathUtils.lerp(chaosPositions[i3], targetPositions[i3], t);
      positions[i3 + 1] = THREE.MathUtils.lerp(chaosPositions[i3 + 1], targetPositions[i3 + 1], t);
      positions[i3 + 2] = THREE.MathUtils.lerp(chaosPositions[i3 + 2], targetPositions[i3 + 2], t);

      // 添加轻微风吹效果
      const windAmp = THREE.MathUtils.lerp(0.3, 0.02, t);
      const time = state.clock.elapsedTime;
      positions[i3] += Math.sin(time * 2 + positions[i3 + 1] * 0.5) * windAmp;
      positions[i3 + 2] += Math.cos(time * 1.6 + positions[i3] * 0.5) * windAmp;
    }

    geometry.attributes.position.needsUpdate = true;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  const vertexShader = `
    attribute vec3 aColor;
    attribute float aSize;
    varying vec3 vColor;

    void main() {
      vColor = aColor;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * (600.0 / -mvPosition.z);
      gl_PointSize = clamp(gl_PointSize, 2.0, 100.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec3 vColor;

    void main() {
      vec2 c = gl_PointCoord * 2.0 - 1.0;
      float r = length(c);
      if (r > 1.0) discard;
      
      float alpha = 1.0 - smoothstep(0.3, 1.0, r);
      
      // 简单光照
      float light = 0.7 + 0.3 * (1.0 - r);
      vec3 finalColor = vColor * light;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  return (
    <points ref={meshRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        depthTest={true}
        uniforms={{
          uTime: { value: 0 }
        }}
      />
    </points>
  );
};
