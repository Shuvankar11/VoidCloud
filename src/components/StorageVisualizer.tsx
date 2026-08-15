import React from 'react';
import { motion } from 'framer-motion';
import { useVault } from '../context/VaultContext';
import { useWeb3Wallet } from '../context/WalletContext';
import { HardDrive, Sparkles, ShieldCheck, Database, Check, Server, Cloud, Cpu, ArrowUpRight, Coins, Shield, CheckCircle2 } from 'lucide-react';

export const StorageVisualizer: React.FC = () => {
  const { session, claimBonusWithZKProof, isGeneratingProof, files } = useVault();
  const { setIsPricingModalOpen } = useWeb3Wallet();

  const totalCapacityBytes = session.quotaGB * 1024 * 1024 * 1024;
  const activeFiles = files.filter(f => f.status === 'shielded');
  const usedBytes = activeFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const percentUsed = Math.min(100, Math.max(0, (usedBytes / totalCapacityBytes) * 100));
  const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const remainingGB = Math.max(0, (totalCapacityBytes - usedBytes) / (1024 * 1024 * 1024)).toFixed(2);

  const docBytes = activeFiles
    .filter(f => f.name.endsWith('.pdf') || f.name.endsWith('.enc') || f.name.endsWith('.docx') || f.name.endsWith('.txt'))
    .reduce((acc, f) => acc + f.sizeBytes, 0);
  const dataBytes = activeFiles
    .filter(f => !f.name.endsWith('.pdf') && !f.name.endsWith('.enc') && !f.name.endsWith('.docx') && !f.name.endsWith('.txt'))
    .reduce((acc, f) => acc + f.sizeBytes, 0);

  return (
    <section id="storage" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0E1424] border border-sky-500/30 text-sky-300 text-xs font-mono mb-4">
          <Server className="w-3.5 h-3.5" />
          <span>DECENTRALIZED STORAGE & EXPANSION ENGINE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Cloud Capacity & Quota Management
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base">
          Every user starts with <strong className="text-sky-300">20 GB Free Baseline Storage</strong>. Expand with a <strong className="text-emerald-400">1-Time +20 GB Testnet Faucet Bonus</strong>, or upgrade to <strong className="text-amber-300">50GB - 500GB Tiers</strong> paid directly in NIGHT tokens, ADA, and stablecoins.
        </p>
      </div>

      {/* Main Visualizer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Cloud Gauge Card */}
        <div className="lg:col-span-8 cloud-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <span className="text-xs font-mono text-slate-400 block">TOTAL ALLOCATED CAPACITY</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-display font-extrabold text-white">{session.quotaGB}</span>
                  <span className="text-xl font-display text-sky-400 font-semibold">GB</span>
                  {session.quotaGB > 40 ? (
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 text-xs font-mono">
                      PREMIUM TIER ACTIVE ({session.quotaGB} GB)
                    </span>
                  ) : session.bonusClaimed ? (
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
                      +20GB FAUCET EXPANSION ACTIVE
                    </span>
                  ) : (
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-400 text-xs font-mono">
                      20GB FREE TIER
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-400 block">ENCRYPTED USAGE</span>
                <span className="text-2xl font-mono font-bold text-sky-300">{usedGB} GB</span>
                <span className="text-xs text-slate-500 block">({percentUsed.toFixed(1)}% utilized)</span>
              </div>
            </div>

            {/* Segmented Cloud Progress Bar */}
            <div className="space-y-3 my-6">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>0 GB</span>
                <span className="text-sky-400">20 GB (Free Base)</span>
                <span className={session.bonusClaimed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  40 GB (Testnet Max)
                </span>
                {session.quotaGB > 40 && (
                  <span className="text-amber-400 font-bold">{session.quotaGB} GB (Pro)</span>
                )}
              </div>

              {/* Progress Track */}
              <div className="h-5 w-full bg-[#080D1A] rounded-xl p-1 border border-slate-800 relative overflow-hidden flex items-center">
                {/* 20 GB Divider Marker */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700 z-10" />

                {/* Animated Gradient Fill */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentUsed}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-lg bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 shadow-[0_0_15px_rgba(56,189,248,0.4)] relative"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/80 rounded-r-lg animate-pulse" />
                </motion.div>
              </div>

              <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-1">
                <span>Available Storage: <strong className="text-emerald-400">{remainingGB} GB</strong></span>
                <span>Active Objects: <strong className="text-sky-300">{activeFiles.length}</strong></span>
              </div>
            </div>

            {/* Storage Categories Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-[#080D1A] border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Encrypted Documents
                </span>
                <p className="text-lg font-mono font-bold text-white mt-1">{(docBytes / (1024 * 1024)).toFixed(1)} MB</p>
                <span className="text-[11px] text-slate-500">AES-256 Envelope</span>
              </div>

              <div className="bg-[#080D1A] border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Media & Data Shards
                </span>
                <p className="text-lg font-mono font-bold text-white mt-1">{(dataBytes / (1024 * 1024)).toFixed(1)} MB</p>
                <span className="text-[11px] text-slate-500">Distributed Relay</span>
              </div>

              <div className="bg-[#080D1A] border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Storage Tier
                </span>
                <p className="text-sm font-mono font-bold text-white mt-1 truncate">{session.planName || 'Free 20GB'}</p>
                <span className="text-[11px] text-slate-500">Midnight Preprod</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Strip */}
          <div className="pt-6 mt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>Storage Architecture: <strong className="text-slate-200">Decentralized Shielded Relay</strong></span>
            </div>

            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all hover:scale-105"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Buy More Storage (50GB - 500GB)</span>
            </button>
          </div>
        </div>

        {/* Right: +20GB Faucet Bonus Card & Pro Tiers */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Card 1: 1-Time Faucet Bonus */}
          <div className="cloud-card rounded-2xl p-6 border-emerald-500/30 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono mb-2">
                <Sparkles className="w-4 h-4" />
                <span>1-TIME TESTNET FAUCET</span>
              </div>
              <h3 className="text-xl font-display font-bold text-white">
                Claim +20 GB Bonus
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Execute a Halo2 zero-knowledge circuit to synthesize a blinded nullifier hash and unlock +20 GB expansion.
              </p>

              <div className="mt-4 p-3 rounded-xl bg-[#080D1A] border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Nullifier Hash:</span>
                  <span className="text-sky-300">{session.nullifierHex.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bonus Status:</span>
                  <span className={session.bonusClaimed ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {session.bonusClaimed ? 'CLAIMED (+20GB)' : 'AVAILABLE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-5">
              {!session.bonusClaimed ? (
                <button
                  onClick={() => claimBonusWithZKProof()}
                  disabled={isGeneratingProof}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all hover:scale-105"
                >
                  {isGeneratingProof ? 'Synthesizing Proof...' : 'Claim +20GB Faucet Bonus'}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs text-center flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Bonus Active (40GB Vault)</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Mainnet Pro Tiers Banner */}
          <div className="cloud-card rounded-2xl p-6 border-amber-500/30 bg-gradient-to-br from-[#080D1A] via-[#0E1424] to-amber-950/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-2">
                <Coins className="w-4 h-4" />
                <span>EXPAND CAPACITY WITH TOKENS</span>
              </div>
              <h4 className="text-lg font-display font-bold text-white">
                50GB, 100GB & 500GB Tiers
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Need more storage beyond 40GB? Pay with NIGHT tokens, ADA, USDT, or ETH.
              </p>
            </div>

            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all hover:scale-105"
            >
              View Storage Plans & Pricing
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
