import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CloudStorageVault3D: React.FC = () => {
  const rootGroupRef = useRef<THREE.Group>(null!);
  const cloudGroupRef = useRef<THREE.Group>(null!);
  const drivePlattersRef = useRef<THREE.Group>(null!);
  const orbitingFilesGroupRef = useRef<THREE.Group>(null!);
  const syncBeamsRef = useRef<THREE.Points>(null!);

  // Generate 250 upward streaming cloud sync particles (upload/sync animation)
  const particleCount = 250;
  const [particlesPos, initialY] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const initY = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.5 + Math.random() * 2.2;
      const angle = Math.random() * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = -2.5 + Math.random() * 5.0;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      initY[i] = y;
    }

    return [pos, initY];
  }, [particleCount]);

  useFrame((state) => {
    const { pointer, clock } = state;
    const time = clock.getElapsedTime();

    // 1. Smooth Interactive Hover Tilt
    if (rootGroupRef.current) {
      rootGroupRef.current.rotation.y = pointer.x * 0.45;
      rootGroupRef.current.rotation.x = 0.15 + pointer.y * -0.3;
      rootGroupRef.current.position.y = Math.sin(time * 1.5) * 0.08;
    }

    // 2. Cloud Floating Animation
    if (cloudGroupRef.current) {
      cloudGroupRef.current.position.y = Math.sin(time * 2.0) * 0.05;
    }

    // 3. Storage Drive Platters Spin (simulating real disk read/write)
    if (drivePlattersRef.current) {
      drivePlattersRef.current.rotation.y = time * 2.5;
    }

    // 4. Orbiting Encrypted File Badges
    if (orbitingFilesGroupRef.current) {
      orbitingFilesGroupRef.current.rotation.y = time * 0.4;
    }

    // 5. Upward Streaming Cloud Data Sync Particles
    if (syncBeamsRef.current) {
      const posAttr = syncBeamsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        let y = arr[i * 3 + 1];
        y += 0.025; // Stream upwards towards the cloud
        if (y > 2.5) {
          y = -2.5;
        }
        arr[i * 3 + 1] = y;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={rootGroupRef} position={[0, -0.2, 0]}>
      
      {/* ============================================================ */}
      {/* 1. 3D FLOATING HOLOGRAPHIC CLOUD VAULT                      */}
      {/* ============================================================ */}
      <group ref={cloudGroupRef} position={[0, 0.4, 0]}>
        {/* Main Central Cloud Puff */}
        <mesh position={[0, 0, 0]} scale={[1.3, 1.0, 1.1]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial
            color="#38BDF8"
            emissive="#0284C7"
            emissiveIntensity={0.3}
            roughness={0.15}
            metalness={0.1}
            transmission={0.6}
            ior={1.3}
            thickness={1.5}
            transparent={true}
            opacity={0.85}
          />
        </mesh>

        {/* Left Cloud Bubble */}
        <mesh position={[-0.85, -0.1, 0.1]} scale={[0.9, 0.8, 0.85]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial
            color="#60A5FA"
            emissive="#0EA5E9"
            emissiveIntensity={0.25}
            roughness={0.2}
            transmission={0.55}
            ior={1.3}
            transparent={true}
            opacity={0.8}
          />
        </mesh>

        {/* Right Cloud Bubble */}
        <mesh position={[0.85, -0.15, 0.05]} scale={[0.85, 0.75, 0.8]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial
            color="#38BDF8"
            emissive="#0284C7"
            emissiveIntensity={0.25}
            roughness={0.2}
            transmission={0.55}
            ior={1.3}
            transparent={true}
            opacity={0.8}
          />
        </mesh>

        {/* Top Cloud Bubble */}
        <mesh position={[0.2, 0.5, -0.05]} scale={[0.8, 0.75, 0.8]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial
            color="#E0F2FE"
            emissive="#38BDF8"
            emissiveIntensity={0.35}
            roughness={0.1}
            transmission={0.65}
            ior={1.3}
            transparent={true}
            opacity={0.85}
          />
        </mesh>

        {/* Cloud Internal Glowing Core (ZK Shield Lock) */}
        <mesh position={[0, 0, 0.4]} scale={[0.35, 0.35, 0.35]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#10B981"
            emissiveIntensity={1.4}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 2. 3D DECENTRALIZED STORAGE DRIVE CYLINDERS (Under Cloud)    */}
      {/* ============================================================ */}
      <group position={[0, -1.2, 0]}>
        {/* Drive Base Chassis (Deep Gunmetal Chrome) */}
        <mesh scale={[1.3, 0.15, 1.3]}>
          <cylinderGeometry args={[1, 1, 1, 32]} />
          <meshStandardMaterial
            color="#0B132B"
            metalness={0.9}
            roughness={0.15}
            emissive="#0369A1"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Rotating Storage Disk Platters */}
        <group ref={drivePlattersRef}>
          <mesh position={[0, 0.18, 0]} scale={[1.1, 0.08, 1.1]}>
            <cylinderGeometry args={[1, 1, 1, 32]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#0EA5E9"
              emissiveIntensity={0.6}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, 0.36, 0]} scale={[0.95, 0.06, 0.95]}>
            <cylinderGeometry args={[1, 1, 1, 32]} />
            <meshStandardMaterial
              color="#60A5FA"
              emissive="#2563EB"
              emissiveIntensity={0.7}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, 0.52, 0]} scale={[0.8, 0.05, 0.8]}>
            <cylinderGeometry args={[1, 1, 1, 32]} />
            <meshStandardMaterial
              color="#10B981"
              emissive="#059669"
              emissiveIntensity={0.8}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        </group>

        {/* Holographic Disk Glow Ring */}
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.015, 16, 64]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 3. 4 ORBITING ENCRYPTED FILE TILES (Documents, Media, Keys)  */}
      {/* ============================================================ */}
      <group ref={orbitingFilesGroupRef}>
        {/* File 1: Encrypted PDF Document (Azure) */}
        <group position={[2.2, 0.5, 0]}>
          <mesh scale={[0.35, 0.45, 0.04]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#0F172A" emissive="#38BDF8" emissiveIntensity={0.8} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.03]} scale={[0.2, 0.25, 0.01]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* File 2: Database Backup Shard (Emerald) */}
        <group position={[-2.2, 0.2, 0]}>
          <mesh scale={[0.38, 0.38, 0.08]}>
            <cylinderGeometry args={[1, 1, 1, 16]} />
            <meshStandardMaterial color="#064E3B" emissive="#10B981" emissiveIntensity={0.9} metalness={0.8} />
          </mesh>
        </group>

        {/* File 3: Cryptographic Private Key (Gold/Amber) */}
        <group position={[0, 0.8, 2.0]}>
          <mesh scale={[0.35, 0.35, 0.04]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#1E293B" emissive="#F59E0B" emissiveIntensity={0.9} metalness={0.8} />
          </mesh>
        </group>

        {/* File 4: Encrypted Media Archive (Blue) */}
        <group position={[0, -0.3, -2.0]}>
          <mesh scale={[0.38, 0.45, 0.04]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#0F172A" emissive="#60A5FA" emissiveIntensity={0.8} metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ============================================================ */}
      {/* 4. UPWARD STREAMING CLOUD DATA SYNC BEAMS                    */}
      {/* ============================================================ */}
      <points ref={syncBeamsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlesPos, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#38BDF8"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Cloud Studio Lighting */}
      <pointLight position={[0, 1.5, 1]} intensity={3.0} distance={5} color="#38BDF8" />
      <directionalLight position={[5, 8, 5]} intensity={1.8} color="#F0F9FF" />
      <directionalLight position={[-5, -4, -3]} intensity={1.0} color="#0284C7" />
      <pointLight position={[0, -1.2, 0]} intensity={2.0} distance={4} color="#10B981" />
    </group>
  );
};
