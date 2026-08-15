import React from 'react';
import { motion } from 'framer-motion';
import { useVault } from '../context/VaultContext';
import { InteractiveCloudDriveHero } from './InteractiveCloudDriveHero';
import { Cloud, ShieldCheck, Sparkles, ArrowRight, Lock, CheckCircle2, HardDrive, Database, Server, Shield } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { session, claimBonusWithZKProof, isGeneratingProof } = useVault();

  return (
    <section id="overview" className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Radiant Space Navy Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-sky-600/15 via-blue-700/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-cloud-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Column: Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="lg:col-span-6 space-y-6 text-center lg:text-left"
        >
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0E1424] border border-slate-700/80 text-sky-300 text-xs font-mono shadow-md backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>MIDNIGHT NETWORK // DECENTRALIZED ENCRYPTED STORAGE PROTOCOL</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
            Next-Generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-emerald-400">
              Shielded Cloud Vault
            </span> <br />
            & Decentralized Drive.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed font-sans">
            Store, sync, and backup your private files with client-side AES-256-GCM encryption and Midnight Compact smart contracts. Enjoy <span className="text-sky-400 font-semibold">20 GB free</span> baseline cloud storage with a <span className="text-emerald-400 font-semibold">1-time +20 GB testnet faucet expansion</span>.
          </p>

          {/* Storage Quota Badges */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start items-center pt-1">
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#0E1424] border border-slate-700/80 text-xs font-mono">
              <Cloud className="w-4 h-4 text-sky-400" />
              <span className="text-slate-400">Base Storage:</span>
              <span className="text-sky-400 font-bold">20 GB</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#0E1424] border border-slate-700/80 text-xs font-mono">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Expansion:</span>
              <span className="text-emerald-400 font-bold">+20 GB</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#0E1424] border border-slate-700/80 text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Max Capacity:</span>
              <span className="text-white font-bold">40 GB</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-3">
            <a
              href="#vault"
              className="inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm tracking-wide shadow-[0_0_25px_rgba(14,165,233,0.35)] transition-all hover:scale-105"
            >
              <HardDrive className="w-4 h-4" />
              <span>Open Shielded Vault</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {!session.bonusClaimed ? (
              <button
                onClick={() => claimBonusWithZKProof()}
                disabled={isGeneratingProof}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#0E1424] hover:bg-[#141D30] border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Claim +20GB Faucet Bonus</span>
              </button>
            ) : (
              <div className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Bonus Active (40GB Cloud Tier)</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Interactive Live Cloud Drive Mockup Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
          className="lg:col-span-6 flex items-center justify-center"
        >
          <InteractiveCloudDriveHero />
        </motion.div>

      </div>
    </section>
  );
};
