import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StorageHub {
  name: string;
  lat: number;
  lng: number;
  color: string;
}

const STORAGE_HUBS: StorageHub[] = [
  { name: 'US-East (Virginia)', lat: 37.7749, lng: -77.4194, color: '#38BDF8' },
  { name: 'US-West (Oregon)', lat: 45.5152, lng: -122.6784, color: '#38BDF8' },
  { name: 'EU-Central (Frankfurt)', lat: 50.1109, lng: 8.6821, color: '#10B981' },
  { name: 'EU-West (London)', lat: 51.5074, lng: -0.1278, color: '#38BDF8' },
  { name: 'AP-East (Tokyo)', lat: 35.6762, lng: 139.6503, color: '#38BDF8' },
  { name: 'AP-South (Singapore)', lat: 1.3521, lng: 103.8198, color: '#10B981' },
  { name: 'AP-Southeast (Sydney)', lat: -33.8688, lng: 151.2093, color: '#38BDF8' },
  { name: 'ME-Central (Dubai)', lat: 25.2048, lng: 55.2708, color: '#38BDF8' },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const GlobalCloudGlobe3D: React.FC = () => {
  const globeGroupRef = useRef<THREE.Group>(null!);
  const atmosphereRef = useRef<THREE.Mesh>(null!);
  const particlesRef = useRef<THREE.Points>(null!);
  const arcsGroupRef = useRef<THREE.Group>(null!);

  const globeRadius = 2.0;

  // 1. Generate 1,400 surface dot matrix points for continents
  const [globePoints] = useMemo(() => {
    const count = 1400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = globeRadius * 1.01;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return [pos];
  }, [globeRadius]);

  // 2. Hub vectors on globe
  const hubPositions = useMemo(() => {
    return STORAGE_HUBS.map((hub) => ({
      ...hub,
      vec: latLngToVector3(hub.lat, hub.lng, globeRadius * 1.02),
    }));
  }, [globeRadius]);

  // 3. Generate 3D Arcs connecting storage hubs
  const arcCurves = useMemo(() => {
    const curves: THREE.QuadraticBezierCurve3[] = [];
    for (let i = 0; i < hubPositions.length; i++) {
      const nextIdx = (i + 1) % hubPositions.length;
      const v1 = hubPositions[i].vec;
      const v2 = hubPositions[nextIdx].vec;

      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const distance = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(globeRadius + distance * 0.35);

      curves.push(new THREE.QuadraticBezierCurve3(v1, mid, v2));
    }
    return curves;
  }, [hubPositions, globeRadius]);

  useFrame((state) => {
    const { pointer, clock } = state;
    const time = clock.getElapsedTime();

    if (globeGroupRef.current) {
      // Smooth continuous globe rotation with mouse interaction
      globeGroupRef.current.rotation.y = time * 0.12 + pointer.x * 0.4;
      globeGroupRef.current.rotation.x = 0.2 + pointer.y * -0.25;
      globeGroupRef.current.position.y = Math.sin(time * 1.2) * 0.05;
    }

    if (atmosphereRef.current) {
      const s = 1 + Math.sin(time * 2.0) * 0.02;
      atmosphereRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={globeGroupRef} position={[0, 0, 0]}>
      {/* 1. Deep Space Obsidian Globe Sphere Base */}
      <mesh>
        <sphereGeometry args={[globeRadius, 48, 48]} />
        <meshStandardMaterial
          color="#060A14"
          metalness={0.9}
          roughness={0.2}
          emissive="#03152E"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* 2. Soft Atmospheric Azure Glow Shell */}
      <mesh ref={atmosphereRef} scale={[1.04, 1.04, 1.04]}>
        <sphereGeometry args={[globeRadius, 32, 32]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 3. Surface Data Constellation Points (1,400 Matrix Dots) */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[globePoints, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.032}
          color="#38BDF8"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 4. Decentralized Storage Hub Node Pins & Pulse Beacons */}
      {hubPositions.map((hub, idx) => (
        <group key={idx} position={hub.vec}>
          {/* Central Beacon Dot */}
          <mesh>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive={hub.color}
              emissiveIntensity={1.5}
            />
          </mesh>
          {/* Pulsing Beacon Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08, 0.12, 16]} />
            <meshBasicMaterial color={hub.color} transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* 5. Holographic Inter-Node Shard Data Arcs */}
      <group ref={arcsGroupRef}>
        {arcCurves.map((curve, idx) => {
          const points = curve.getPoints(35);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          return (
            <line key={idx}>
              <bufferGeometry attach="geometry" {...geometry} />
              <lineBasicMaterial
                attach="material"
                color="#38BDF8"
                transparent
                opacity={0.45}
                linewidth={1.5}
              />
            </line>
          );
        })}
      </group>

      {/* 6. Orbital Equator Data Ring */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[2.55, 0.008, 16, 100]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.35} />
      </mesh>

      {/* Cinematic Globe Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 8, 6]} intensity={2.0} color="#F0F9FF" />
      <directionalLight position={[-6, -4, -4]} intensity={1.0} color="#0284C7" />
      <pointLight position={[0, 0, 0]} intensity={2.0} distance={5} color="#38BDF8" />
    </group>
  );
};
