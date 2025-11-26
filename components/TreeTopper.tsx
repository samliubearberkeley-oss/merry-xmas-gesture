import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface TreeTopperProps {
    mode: 'CHAOS' | 'FORMED';
}

export const TreeTopper: React.FC<TreeTopperProps> = ({ mode }) => {
    const groupRef = useRef<THREE.Group>(null);
    const starRef = useRef<THREE.Group>(null);
    const innerRingRef = useRef<THREE.Mesh>(null);
    const outerRingRef = useRef<THREE.Mesh>(null);

    // Reuse material for performance
    const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#FFD700",
        roughness: 0.2,
        metalness: 1.0,
        emissive: "#B8860B",
        emissiveIntensity: 0.2,
    }), []);

    useFrame((state) => {
        if (!groupRef.current || !starRef.current || !innerRingRef.current || !outerRingRef.current) return;
        
        const targetPos = new THREE.Vector3(0, 8.8, 0); // Sits on top of the tree tip
        const chaosPos = new THREE.Vector3(0, 25, 0);
        
        const dest = mode === 'FORMED' ? targetPos : chaosPos;
        
        // 1. Lerp Position
        groupRef.current.position.lerp(dest, 0.04);

        // 2. Complex Rotation Animations
        // The main star spins slowly
        starRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        starRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

        // Inner ring spins on X axis with a slight wobble
        innerRingRef.current.rotation.x = state.clock.elapsedTime * 0.5;
        innerRingRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;

        // Outer ring spins on Y axis
        outerRingRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        outerRingRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;

        // 3. Pulse Scale
        // Heartbeat effect
        const s = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.05;
        groupRef.current.scale.setScalar(s);
    });

    // Helper to create spikes
    const Spike = ({ rot, len, width }: { rot: [number, number, number], len: number, width: number }) => (
        <group rotation={rot}>
            <mesh position={[0, len / 2, 0]} material={goldMaterial}>
                <coneGeometry args={[width, len, 4]} />
            </mesh>
        </group>
    );

    return (
        <group ref={groupRef}>
            {/* --- Central Star Cluster --- */}
            <group ref={starRef}>
                {/* Core */}
                <mesh material={goldMaterial}>
                    <dodecahedronGeometry args={[0.6, 0]} />
                </mesh>

                {/* Cardinal Spikes (Long) - Y Axis */}
                <Spike rot={[0, 0, 0]} len={3.5} width={0.2} />
                <Spike rot={[Math.PI, 0, 0]} len={3.5} width={0.2} />
                
                {/* Cardinal Spikes - X Axis */}
                <Spike rot={[0, 0, Math.PI / 2]} len={3.5} width={0.2} />
                <Spike rot={[0, 0, -Math.PI / 2]} len={3.5} width={0.2} />

                {/* Cardinal Spikes - Z Axis */}
                <Spike rot={[Math.PI / 2, 0, 0]} len={3.5} width={0.2} />
                <Spike rot={[-Math.PI / 2, 0, 0]} len={3.5} width={0.2} />

                {/* Diagonal Spikes (Shorter) */}
                <group rotation={[0, Math.PI / 4, 0]}>
                    <Spike rot={[0, 0, Math.PI / 4]} len={2.0} width={0.15} />
                    <Spike rot={[0, 0, -Math.PI / 4]} len={2.0} width={0.15} />
                    <Spike rot={[0, 0, 3 * Math.PI / 4]} len={2.0} width={0.15} />
                    <Spike rot={[0, 0, -3 * Math.PI / 4]} len={2.0} width={0.15} />
                </group>
                 <group rotation={[0, -Math.PI / 4, 0]}>
                    <Spike rot={[0, 0, Math.PI / 4]} len={2.0} width={0.15} />
                    <Spike rot={[0, 0, -Math.PI / 4]} len={2.0} width={0.15} />
                    <Spike rot={[0, 0, 3 * Math.PI / 4]} len={2.0} width={0.15} />
                    <Spike rot={[0, 0, -3 * Math.PI / 4]} len={2.0} width={0.15} />
                </group>
            </group>

            {/* --- Gyroscope Rings --- */}
            <mesh ref={innerRingRef}>
                <torusGeometry args={[2.0, 0.05, 8, 64]} />
                <meshStandardMaterial 
                    color="#FFD700" 
                    emissive="#FFD700" 
                    emissiveIntensity={0.5} 
                    toneMapped={false} 
                />
            </mesh>

            <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2.8, 0.08, 8, 64]} />
                <meshStandardMaterial 
                    color="#D4AF37" 
                    emissive="#D4AF37" 
                    emissiveIntensity={0.2} 
                    roughness={0.1}
                    metalness={1}
                />
            </mesh>

            {/* --- Lighting & Effects --- */}
            <pointLight distance={15} intensity={8} color="#FFD700" decay={2} />
            
            {/* Core Glow */}
            <mesh>
                 <sphereGeometry args={[0.8, 16, 16]} />
                 <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
            </mesh>

            {/* Magical Sparkles */}
            <Sparkles 
                count={80} 
                scale={5} 
                size={6} 
                speed={0.4} 
                opacity={0.8} 
                color="#FFFACD" 
            />
        </group>
    );
};
