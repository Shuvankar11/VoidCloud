import React from 'react';
import { useVault } from '../context/VaultContext';
import { Cloud, Github, ArrowUpRight, CheckCircle2, Shield, HardDrive, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { metrics, session } = useVault();

  return (
    <footer className="relative bg-[#030712] border-t border-slate-800/80 pt-16 pb-12 overflow-hidden">
      {/* Soft Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-20 bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Info */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 via-blue-600/20 to-emerald-500/20 border border-sky-500/40 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-sky-400" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-display font-bold text-lg text-white">VOID</span>
                <span className="font-display font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">CLOUD</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed font-sans">
              Privacy-first decentralized cloud storage powered by Midnight Network. Zero-knowledge nullifier faucet bonuses, client-side AES-256-GCM envelope encryption, and private user vault partitions.
            </p>

            {/* Level 1 Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#080D1A] border border-slate-700/80 text-[11px] font-mono text-sky-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Midnight Network Hackathon // Level 1 Spec</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display font-semibold text-xs tracking-wider uppercase text-white">Platform Navigation</h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li><a href="#overview" className="hover:text-sky-400 transition-colors">Overview</a></li>
              <li><a href="#storage" className="hover:text-sky-400 transition-colors">Cloud Quota ({session.quotaGB} GB)</a></li>
              <li><a href="#vault" className="hover:text-sky-400 transition-colors">Object Vault</a></li>
              <li><a href="#features" className="hover:text-sky-400 transition-colors">Security Architecture</a></li>
            </ul>
          </div>

          {/* Col 3: Midnight Preprod Status */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display font-semibold text-xs tracking-wider uppercase text-white">Network Status</h4>
            <div className="bg-[#080D1A] p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Network:</span>
                <span className="text-sky-300 font-bold">Midnight Preprod</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Proof Server:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {metrics.proofServerStatus} ({metrics.proofServerLatencyMs}ms)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Block Height:</span>
                <span className="text-sky-300">#{metrics.blockHeight}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Contract:</span>
                <span className="text-slate-400 text-[10px]">{metrics.contractAddress.slice(0, 10)}...</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} VoidCloud Protocol. Built for Midnight Network.
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="https://midnight.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-400 transition-colors flex items-center gap-1"
            >
              <span>Midnight Docs</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
