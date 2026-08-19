import React from 'react';
import { useVault } from '../context/VaultContext';
import { ShieldCheck, Cpu, Database, CheckCircle2, Cloud, Terminal } from 'lucide-react';

export const TopMarquee: React.FC = () => {
  const { metrics, session } = useVault();

  const tickerItems = [
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-600 inline mr-1" />,
      text: `ZK-SNARK VERIFIED: 0x9f8...a1 in 1.28s`,
      highlight: 'text-sky-700 font-semibold',
    },
    {
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />,
      text: `MIDNIGHT PREPROD: 99.99% UP | BLOCK #${metrics.blockHeight}`,
      highlight: 'text-emerald-700 font-semibold',
    },
    {
      icon: <Cloud className="w-3.5 h-3.5 text-blue-600 inline mr-1" />,
      text: `+20GB TESTNET FAUCET UNLOCKED VIA ZK NULLIFIER`,
      highlight: 'text-blue-700 font-semibold',
    },
    {
      icon: <Cpu className="w-3.5 h-3.5 text-purple-600 inline mr-1" />,
      text: `HALO2 PROOF SERVER: ${metrics.proofServerLatencyMs}ms LATENCY`,
      highlight: 'text-purple-700 font-semibold',
    },
    {
      icon: <Database className="w-3.5 h-3.5 text-slate-600 inline mr-1" />,
      text: `SHIELDED NETWORK POOL: ${metrics.totalShieldedStorageAllocatedGB.toLocaleString()} GB ALLOCATED`,
      highlight: 'text-slate-700 font-semibold',
    },
    {
      icon: <Terminal className="w-3.5 h-3.5 text-sky-700 inline mr-1" />,
      text: `ANTIGRAVITY CLI v1.0.0 READY: \`npx void init\``,
      highlight: 'text-sky-800 font-semibold',
    },
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />,
      text: `ACTIVE VAULT: ${session.quotaGB} GB ALLOCATED | ${session.bonusClaimed ? 'BONUS ACTIVE' : 'BONUS AVAILABLE'}`,
      highlight: 'text-emerald-700 font-semibold',
    },
  ];

  return (
    <div className="w-full bg-white/70 backdrop-blur-md border-b border-sky-100/80 py-1.5 px-4 overflow-hidden relative select-none z-30">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/90 to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee space-x-8 font-mono text-[11px] text-slate-600 items-center">
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div key={idx} className="flex items-center space-x-1.5 whitespace-nowrap">
            {item.icon}
            <span className={item.highlight}>{item.text}</span>
            <span className="text-slate-300 ml-4 font-normal">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
