import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CloudStorageVault3D } from './CloudStorageVault3D';
import { Cloud, ShieldCheck, HardDrive, RefreshCw } from 'lucide-react';

export const Hero3DCanvas: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  return (
    <div className="relative w-full h-[460px] lg:h-[540px] flex items-center justify-center">
      {/* Background Soft Atmospheric Cloud Glow */}
      <div className="absolute inset-0 bg-cloud-glow pointer-events-none" />

      {hasWebGL ? (
        <Canvas
          camera={{ position: [0, 0, 5.0], fov: 46 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.75} />
          <directionalLight position={[8, 10, 6]} intensity={1.8} color="#F0F9FF" />
          <Suspense fallback={null}>
            <CloudStorageVault3D />
          </Suspense>
        </Canvas>
      ) : (
        /* CSS Fallback */
        <div className="relative w-64 h-64 rounded-2xl border border-sky-500/40 animate-pulse flex items-center justify-center shadow-[0_0_50px_rgba(14,165,233,0.2)] bg-[#080D1A]">
          <Cloud className="w-20 h-20 text-sky-400" />
        </div>
      )}

      {/* Floating Cloud Storage Drive Badge */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#080D1A]/95 backdrop-blur-md border border-slate-700/80 text-[11px] font-mono text-slate-300 flex items-center space-x-2.5 pointer-events-none shadow-2xl">
        <HardDrive className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
        <span>3D CLOUD STORAGE VAULT // REAL-TIME ZK SHIELDED SYNC</span>
      </div>
    </div>
  );
};
