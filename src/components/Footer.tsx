import React from 'react';
import { useVault } from '../context/VaultContext';
import { Cloud, Github, CheckCircle2, Shield, HardDrive, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { metrics, session, setActiveView } = useVault();

  return (
    <footer className="relative bg-white/80 border-t border-slate-200/80 pt-12 pb-8 overflow-hidden text-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-200/80">
          
          {/* Col 1: Brand & Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-sky-400 shadow-sm flex items-center justify-center bg-white">
                <img src="/voidcloud-logo.jpg" alt="Void Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-display font-black text-base text-slate-900">VOID</span>
                <span className="font-display font-black text-base text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">CLOUD</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Privacy-first decentralized zero-knowledge cloud storage powered by Midnight Network. Client-side AES-256-GCM envelope encryption and off-chain Halo2 ZK-SNARK verifier.
            </p>

            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-mono text-sky-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Midnight Network Preprod // Compact 0.20 Verified</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-display font-bold text-xs tracking-wider uppercase text-slate-900">Navigation</h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li><button onClick={() => setActiveView('landing')} className="hover:text-sky-600 transition-colors block text-left">Home</button></li>
              <li><button onClick={() => setActiveView('dashboard')} className="hover:text-sky-600 transition-colors block text-left">Vault Dashboard ({session.quotaGB} GB)</button></li>
              <li><button onClick={() => setActiveView('gallery')} className="hover:text-sky-600 transition-colors block text-left">Media Gallery</button></li>
              <li><button onClick={() => setActiveView('payments')} className="hover:text-emerald-600 transition-colors block text-left font-semibold">Payment & Ledger History</button></li>
            </ul>
          </div>

          {/* Col 3: Midnight Preprod Status */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-display font-bold text-xs tracking-wider uppercase text-slate-900">Network Telemetry</h4>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Network:</span>
                <span className="text-sky-600 font-bold">Midnight Preprod</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Proof Server:</span>
                <span className="text-emerald-600 font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ONLINE ({metrics.proofServerLatencyMs}ms)</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Block Height:</span>
                <span className="text-slate-700 font-bold">#{metrics.blockHeight}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>© 2026 VoidCloud. Built for Midnight Network. All rights reserved.</div>
          <div className="flex items-center space-x-4">
            <a href="https://x.com/Voidcloud18" target="_blank" rel="noreferrer" className="hover:text-sky-600 transition-colors flex items-center space-x-1 font-medium">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X (@Voidcloud18)</span>
            </a>
            <a href="https://github.com/Shuvankar11/VoidCloud" target="_blank" rel="noreferrer" className="hover:text-slate-800 transition-colors flex items-center space-x-1 font-medium">
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <a href="https://midnight.network" target="_blank" rel="noreferrer" className="hover:text-slate-800 transition-colors font-medium">
              Midnight.network
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
