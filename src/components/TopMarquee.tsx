import React from 'react';
import { useVault } from '../context/VaultContext';
import { ShieldCheck, Cpu, Database, CheckCircle2, Lock, Terminal, Cloud } from 'lucide-react';

export const TopMarquee: React.FC = () => {
  const { metrics, session } = useVault();

  const tickerItems = [
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-400 inline mr-1.5" />,
      text: `[ZK-SNARK VERIFIED: 0x9f8...a1 in 1.28s]`,
      highlight: 'text-sky-400',
    },
    {
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline mr-1.5" />,
      text: `[MIDNIGHT PREPROD: 99.99% UP | BLOCK #${metrics.blockHeight}]`,
      highlight: 'text-emerald-400',
    },
    {
      icon: <Cloud className="w-3.5 h-3.5 text-blue-400 inline mr-1.5" />,
      text: `[NULLIFIER ADDED: +20GB TESTNET FAUCET UNLOCKED]`,
      highlight: 'text-blue-400',
    },
    {
      icon: <Cpu className="w-3.5 h-3.5 text-sky-300 inline mr-1.5" />,
      text: `[HALO2 PROOF SERVER: ${metrics.proofServerLatencyMs}ms LATENCY]`,
      highlight: 'text-sky-300',
    },
    {
      icon: <Database className="w-3.5 h-3.5 text-blue-300 inline mr-1.5" />,
      text: `[SHIELDED NETWORK POOL: ${metrics.totalShieldedStorageAllocatedGB.toLocaleString()} GB ALLOCATED]`,
      highlight: 'text-blue-300',
    },
    {
      icon: <Terminal className="w-3.5 h-3.5 text-slate-300 inline mr-1.5" />,
      text: `[ANTIGRAVITY CLI v1.0.0 READY: \`npx void init\`]`,
      highlight: 'text-slate-300',
    },
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline mr-1.5" />,
      text: `[ACTIVE CLOUD VAULT: ${session.quotaGB} GB ALLOCATED | ${session.bonusClaimed ? 'BONUS ACTIVE' : 'BONUS AVAILABLE'}]`,
      highlight: 'text-emerald-400',
    },
  ];

  return (
    <div className="w-full bg-[#030712] border-b border-slate-800/80 py-1.5 px-4 overflow-hidden relative select-none z-30">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#030712] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#030712] to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee space-x-8 font-mono text-xs text-slate-400 items-center">
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div key={idx} className="flex items-center space-x-1 whitespace-nowrap">
            {item.icon}
            <span className={item.highlight}>{item.text}</span>
            <span className="text-slate-700 ml-4 font-normal">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
