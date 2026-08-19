import React from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { useWeb3Wallet } from '../context/WalletContext';
import { Cloud, Folder, FileText, ArrowRight, ShieldCheck, Lock, Sparkles, HardDrive, Cpu, CheckCircle2 } from 'lucide-react';

interface HeroLanding3DProps {
  onStartJourney: () => void;
}

export const HeroLanding3D: React.FC<HeroLanding3DProps> = ({ onStartJourney }) => {
  const { session } = useVault();
  const { user } = useAuth();
  const { wallet, setIsPricingModalOpen } = useWeb3Wallet();

  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#E6F3FA] text-slate-900 select-none">
      {/* 3D Atmospheric Clouds Layer (Animated Drifting Clouds) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Sun Ray Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-b from-white/90 via-sky-100/40 to-transparent rounded-full blur-3xl opacity-80" />

        {/* Realistic Layered Drifting Clouds */}
        <div className="absolute top-10 -left-20 w-[500px] h-[220px] bg-white/70 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-32 -right-32 w-[650px] h-[280px] bg-white/80 rounded-full blur-3xl" />
        <div className="absolute top-[280px] left-1/4 w-[800px] h-[340px] bg-gradient-to-t from-white via-white/90 to-transparent rounded-full blur-2xl opacity-95" />
        <div className="absolute bottom-0 inset-x-0 h-[240px] bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 flex flex-col items-center text-center">
        
        {/* 3D FLOATING GLASS CARDS CENTERPIECE (Interactive Hover & Shimmer) */}
        <div className="relative w-full max-w-3xl h-64 sm:h-72 md:h-80 flex items-center justify-center my-2 sm:my-4">
          
          {/* Background Ambient Sparkles */}
          <div className="absolute w-72 h-72 bg-sky-300/40 rounded-full blur-3xl -z-10 animate-pulse" />
          
          {/* Card 1: Left Translucent Folder Glass Card */}
          <div className="absolute -left-2 sm:left-4 md:left-12 top-6 sm:top-8 w-44 sm:w-52 md:w-60 p-4 sm:p-5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/70 shadow-[0_20px_40px_rgba(0,120,200,0.15)] transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-sky-600 shadow-sm mb-3">
              <Folder className="w-5 h-5" />
            </div>
            <div className="h-2.5 w-24 bg-white/80 rounded-full mb-2" />
            <div className="h-2 w-32 bg-white/60 rounded-full mb-1.5" />
            <div className="h-2 w-20 bg-white/50 rounded-full" />
            <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-sky-800/80 font-bold">
              <span>CONFIDENTIAL</span>
              <span>256-BIT</span>
            </div>
          </div>

          {/* Card 2: Center Highlighted 3D Cloud Storage Glass Card */}
          <div className="relative z-20 w-52 sm:w-64 md:w-72 p-5 sm:p-6 rounded-3xl bg-white/60 backdrop-blur-2xl border-2 border-white shadow-[0_25px_60px_rgba(0,100,220,0.25)] transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Cloud className="w-6 h-6" />
            </div>
            <div className="h-3 w-32 bg-slate-800/20 rounded-full mx-auto mb-2.5" />
            <div className="h-2.5 w-40 bg-slate-800/15 rounded-full mx-auto mb-2" />
            <div className="h-2 w-28 bg-slate-800/10 rounded-full mx-auto" />
            
            <div className="mt-5 pt-3 border-t border-white/60 flex items-center justify-between text-[11px] font-mono text-slate-700 font-bold">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>MIDNIGHT ZK</span>
              </span>
              <span className="text-sky-600">40 GB QUOTA</span>
            </div>
          </div>

          {/* Card 3: Right Translucent Document Glass Card */}
          <div className="absolute -right-2 sm:right-4 md:right-12 top-6 sm:top-8 w-44 sm:w-52 md:w-60 p-4 sm:p-5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/70 shadow-[0_20px_40px_rgba(0,120,200,0.15)] transform rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 group">
            <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-blue-600 shadow-sm mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <div className="h-2.5 w-28 bg-white/80 rounded-full mb-2" />
            <div className="h-2 w-36 bg-white/60 rounded-full mb-1.5" />
            <div className="h-2 w-24 bg-white/50 rounded-full" />
            <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-blue-800/80 font-bold">
              <span>ZERO-LEAKAGE</span>
              <span>HALO2 PROOF</span>
            </div>
          </div>
        </div>

        {/* Small Glass Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-sm text-slate-800 text-xs font-semibold mt-4 mb-4">
          <Cloud className="w-3.5 h-3.5 text-sky-500" />
          <span>Next - Gen Cloud Files Storage on Midnight Network</span>
        </div>

        {/* Main Headline (Bold, Clean, Punchy Typography) */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-slate-900 tracking-tight leading-[1.1] max-w-4xl">
          ALL YOUR FILES, STORED AND SECURED IN ONE PLACE
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-600 font-normal max-w-2xl mt-4 leading-relaxed">
          Everything you need to store, organize, and share your files—effortlessly and securely, with zero-knowledge cryptographic privacy from anywhere.
        </p>

        {/* Glowing CTA Button (Matching Reference 1) */}
        <div className="mt-8 flex items-center justify-center">
          <button
            onClick={onStartJourney}
            className="group px-10 py-4 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white font-display font-bold text-base sm:text-lg shadow-[0_12px_35px_rgba(56,189,248,0.45)] hover:shadow-[0_16px_45px_rgba(56,189,248,0.65)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-3 cursor-pointer"
          >
            <span>Start your journey</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-slate-700">
          <div className="flex items-center space-x-1.5 bg-white/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/80 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>20 GB Free Cloud Baseline</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/80 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>AES-256-GCM Envelope Encryption</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>+20 GB Halo2 ZK Faucet Bonus</span>
          </div>
        </div>
      </div>
    </section>
  );
};
