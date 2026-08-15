import React from 'react';
import { Shield, Lock, Terminal, Cpu, Database, KeyRound, Sparkles, CheckCircle2, Server, CloudLightning } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: <Database className="w-5 h-5 text-sky-400" />,
      title: 'Midnight Compact Shielded State',
      description: 'Public blockchain ledger preserves mathematical confidentiality: zero knowledge of individual storage contents, file sizes, or user identities.',
      tag: 'COMPACT v0.20',
      borderGlow: 'hover:border-sky-400',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      title: '1-Time ZK Nullifier Cloud Expansion',
      description: 'Claim an extra +20 GB testnet allocation using cryptographic nullifiers. The smart contract strictly enforces the 1-claim limit without linking your identity.',
      tag: 'ANTI-DOUBLE-CLAIM',
      borderGlow: 'hover:border-emerald-400',
    },
    {
      icon: <Terminal className="w-5 h-5 text-blue-400" />,
      title: 'Antigravity Cloud CLI & DevOps SDK',
      description: 'Interact with VoidCloud natively from your command line. Supports automatic keypair derivation, batch file encryption, ZK proof generation, and vault status sync.',
      tag: 'CLI // CROSS-PLATFORM',
      borderGlow: 'hover:border-blue-400',
    },
    {
      icon: <Lock className="w-5 h-5 text-sky-300" />,
      title: 'Client-Side AES-256-GCM Encryption',
      description: 'Files are encrypted locally in-browser or terminal with ephemeral session keys before being pinned to decentralized storage shards. Zero unencrypted data transit.',
      tag: 'ZERO-LEAKAGE',
      borderGlow: 'hover:border-sky-300',
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      title: 'Sub-Second Off-Chain Proof Server',
      description: 'Heavy Halo2 PLONK arithmetic circuits execute off-chain in sub-second speeds on the Midnight proof server, submitting lightweight verifiable proofs on-chain.',
      tag: 'HALO2 ENGINE',
      borderGlow: 'hover:border-indigo-400',
    },
    {
      icon: <KeyRound className="w-5 h-5 text-rose-400" />,
      title: 'Cryptographic Key Revocation',
      description: 'Revoke and nullify file decryption commitments on-chain. Revoked files cannot be decrypted by any party even if storage node archives are intercepted.',
      tag: 'ACCESS REVOCATION',
      borderGlow: 'hover:border-rose-400',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0E1424] border border-sky-500/30 text-sky-300 text-xs font-mono mb-4">
          <Server className="w-3.5 h-3.5" />
          <span>ZERO-KNOWLEDGE INFRASTRUCTURE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Cloud Architecture & Security Invariants
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base">
          Built from the ground up on the Midnight Network to ensure verifiable mathematical confidentiality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, idx) => (
          <div
            key={idx}
            className={`cloud-card rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 ${f.borderGlow}`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800 shadow-inner">
                  {f.icon}
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  {f.tag}
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-white mb-2">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                {f.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center space-x-1.5 text-[11px] font-mono text-sky-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Midnight Preprod Verified</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
