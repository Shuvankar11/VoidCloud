import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ObsidianCore3D: React.FC = () => {
  const rootGroupRef = useRef<THREE.Group>(null!);
  const serverCoreRef = useRef<THREE.Group>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);
  const nodesGroupRef = useRef<THREE.Group>(null!);
  const particlesRef = useRef<THREE.Points>(null!);

  // Generate 500 fiber-optic data stream particles
  const particleCount = 500;
  const [positions, initialPositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const initPos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.2 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      initPos[i * 3] = x;
      initPos[i * 3 + 1] = y;
      initPos[i * 3 + 2] = z;
    }

    return [pos, initPos];
  }, [particleCount]);

  useFrame((state) => {
    const { pointer, clock } = state;
    const time = clock.getElapsedTime();

    // 1. Interactive Core Tilt & Float
    if (rootGroupRef.current) {
      rootGroupRef.current.rotation.y = time * 0.15 + pointer.x * 0.4;
      rootGroupRef.current.rotation.x = pointer.y * -0.3;
      rootGroupRef.current.position.y = Math.sin(time * 1.5) * 0.08;
    }

    // 2. Server Blade Core Spin
    if (serverCoreRef.current) {
      serverCoreRef.current.rotation.y = time * 0.4;
      serverCoreRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
    }

    // 3. Multi-Axis Holographic Gyroscope Storage Rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.5;
      ring1Ref.current.rotation.x = Math.PI / 3 + Math.sin(time * 0.6) * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 0.6;
      ring2Ref.current.rotation.z = Math.PI / 4;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = time * 0.35;
      ring3Ref.current.rotation.y = Math.PI / 6;
    }

    // 4. Orbiting Decentralized Storage Nodes
    if (nodesGroupRef.current) {
      nodesGroupRef.current.rotation.y = -time * 0.25;
    }

    // 5. Dynamic Fiber-Optic Particle Physics
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const currentPos = posAttr.array as Float32Array;
      const mouseVec = new THREE.Vector3(pointer.x * 3.5, pointer.y * 3.5, 0);

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        let px = currentPos[idx];
        let py = currentPos[idx + 1];
        let pz = currentPos[idx + 2];

        // Smooth orbit rotation around Y axis
        const cosA = Math.cos(0.005);
        const sinA = Math.sin(0.005);
        const rx = px * cosA - pz * sinA;
        const rz = px * sinA + pz * cosA;
        px = rx;
        pz = rz;

        // Anti-Gravity Mouse Repulsion / Attraction
        const pVec = new THREE.Vector3(px, py, pz);
        const dist = pVec.distanceTo(mouseVec);

        if (dist < 1.6) {
          const repel = pVec.clone().sub(mouseVec).normalize();
          const force = (1.6 - dist) * 0.05;
          px += repel.x * force;
          py += repel.y * force;
          pz += repel.z * force;
        } else {
          const origX = initialPositions[idx];
          const origY = initialPositions[idx + 1];
          const origZ = initialPositions[idx + 2];
          px += (origX - px) * 0.02;
          py += (origY - py) * 0.02;
          pz += (origZ - pz) * 0.02;
        }

        currentPos[idx] = px;
        currentPos[idx + 1] = py;
        currentPos[idx + 2] = pz;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={rootGroupRef} position={[0, 0, 0]}>
      
      {/* ============================================================ */}
      {/* 1. CENTRAL ENTERPRISE CLOUD SERVER VAULT CLUSTER              */}
      {/* ============================================================ */}
      <group ref={serverCoreRef}>
        {/* Core Monolith Chassis (Dark Gunmetal Obsidian) */}
        <mesh scale={[1.1, 1.4, 1.1]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#0B132B"
            metalness={0.9}
            roughness={0.15}
            emissive="#0369A1"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Outer Faceted Geometric Crystal Armor */}
        <mesh scale={[1.45, 1.45, 1.45]}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#0F172A"
            metalness={0.8}
            roughness={0.2}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            wireframe={true}
            emissive="#38BDF8"
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* Central Luminous Quantum Data Hub */}
        <mesh scale={[0.65, 0.65, 0.65]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#0EA5E9"
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>

        {/* Vertical Data Bus Conduits (Server Blade Accents) */}
        {[-0.6, 0.6].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh scale={[0.15, 1.6, 0.8]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color="#030712"
                metalness={0.95}
                roughness={0.1}
                emissive="#38BDF8"
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ============================================================ */}
      {/* 2. LAYERED HOLOGRAPHIC QUANTUM GYROSCOPE RINGS               */}
      {/* ============================================================ */}
      {/* Ring 1 - Sapphire Primary Orbit */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.2, 0.018, 16, 120]} />
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#0284C7"
          emissiveIntensity={0.8}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* Ring 2 - Azure Secondary Orbit */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.6, 0.012, 16, 120]} />
        <meshStandardMaterial
          color="#60A5FA"
          emissive="#2563EB"
          emissiveIntensity={0.6}
          metalness={0.8}
        />
      </mesh>

      {/* Ring 3 - Outer Shield Emerald Data Barrier */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[3.0, 0.01, 16, 120]} />
        <meshStandardMaterial
          color="#34D399"
          emissive="#10B981"
          emissiveIntensity={0.7}
          metalness={0.8}
        />
      </mesh>

      {/* ============================================================ */}
      {/* 3. DECENTRALIZED CLOUD STORAGE NODES (6 Shards with Beams)   */}
      {/* ============================================================ */}
      <group ref={nodesGroupRef}>
        {[
          { pos: [2.3, 0.4, 0], color: '#38BDF8', label: 'Node A' },
          { pos: [-2.3, -0.3, 0], color: '#38BDF8', label: 'Node B' },
          { pos: [0, 2.3, 0.5], color: '#10B981', label: 'Node C' },
          { pos: [0, -2.3, -0.5], color: '#60A5FA', label: 'Node D' },
          { pos: [1.6, 1.6, -1.2], color: '#38BDF8', label: 'Node E' },
          { pos: [-1.6, -1.6, 1.2], color: '#10B981', label: 'Node F' },
        ].map((node, i) => (
          <group key={i} position={node.pos as [number, number, number]}>
            {/* Storage Node Chassis */}
            <mesh scale={[0.26, 0.26, 0.26]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color="#0F172A"
                emissive={node.color}
                emissiveIntensity={0.9}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            {/* Corner Armor */}
            <mesh scale={[0.32, 0.32, 0.32]}>
              <octahedronGeometry args={[1, 0]} />
              <meshBasicMaterial color={node.color} wireframe transparent opacity={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ============================================================ */}
      {/* 4. HIGH-DENSITY FIBER-OPTIC DATA PARTICLES                   */}
      {/* ============================================================ */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.042}
          color="#38BDF8"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ============================================================ */}
      {/* 5. CINEMATIC HIGH-TECH CLOUD STUDIO LIGHTING                 */}
      {/* ============================================================ */}
      <pointLight position={[0, 0, 0]} intensity={3.5} distance={6} color="#38BDF8" />
      <directionalLight position={[6, 8, 5]} intensity={2.0} color="#F0F9FF" />
      <directionalLight position={[-6, -6, -4]} intensity={1.2} color="#0284C7" />
      <pointLight position={[0, 3, 0]} intensity={1.5} distance={5} color="#10B981" />
    </group>
  );
};
