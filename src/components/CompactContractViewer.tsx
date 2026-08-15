import React, { useState } from 'react';
import { Layers, ShieldCheck, Eye, EyeOff, FileCode, Check, Copy, Server } from 'lucide-react';

export const CompactContractViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'matrix'>('code');
  const [copied, setCopied] = useState(false);

  const compactCode = `// contracts/voidcloud.compact (Midnight Network Compact Specification)
pragma language_version >= 0.20;

import CompactStandardLibrary;

// ==========================================
// 1. PUBLIC LEDGER STATE (Cloud Verified)
// ==========================================
ledger {
    // Total number of initialized shielded storage vaults
    totalRegisteredUsers: Counter;

    // Total allocated shielded storage across the network (in Gigabytes)
    totalShieldedStorageAllocated: Counter;

    // Set of nullifier hashes for 1-time testnet bonus claims (prevents double-claims)
    bonusNullifiers: Set<Bytes<32>>;
}

// ==========================================
// 2. PRIVATE WITNESS DECLARATION (Client-Side Only)
// ==========================================
witness userSecret(): Bytes<32>;
witness fileCommitmentSecret(): Bytes<32>;

// ==========================================
// 3. EXPORTED CIRCUITS
// ==========================================
export circuit initializeUserStorage(): [] {
    const secret = userSecret();
    const secretHash = persistent_hash<Vector<2, Bytes<32>>>([
        secret,
        pad(32, "voidcloud:v1:user_init")
    ]);
    assert secretHash != pad(32, 0) "Invalid zero-knowledge secret entropy";

    totalRegisteredUsers.increment(1);
    totalShieldedStorageAllocated.increment(20);
}

export circuit claimTestnetBonus(nullifier: Bytes<32>): [] {
    const secret = userSecret();
    const expectedNullifier = persistent_hash<Vector<2, Bytes<32>>>([
        secret,
        pad(32, "voidcloud:testnet:faucet_nullifier")
    ]);

    assert nullifier == expectedNullifier "Nullifier does not match private witness";
    assert !bonusNullifiers.member(nullifier) "Testnet bonus already claimed for this nullifier";

    bonusNullifiers.insert(nullifier);
    totalShieldedStorageAllocated.increment(20);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(compactCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contract" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0E1424] border border-sky-500/30 text-sky-300 text-xs font-mono mb-4">
          <Layers className="w-3.5 h-3.5" />
          <span>MIDNIGHT SMART CONTRACT ENGINE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Compact Contract & State Invariants
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base">
          Explore the exact Compact source code enforcing on-chain shielded cloud storage rules and zero-knowledge nullifiers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-[#080D1A] p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'code'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>voidcloud.compact</span>
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'matrix'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Public State vs Private Witness</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'code' ? (
        <div className="cloud-card rounded-2xl overflow-hidden border border-slate-800">
          <div className="bg-[#080D1A] px-6 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="text-xs font-mono text-slate-300">contracts/voidcloud.compact (Midnight v0.20.4)</span>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-sky-400 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Source'}</span>
            </button>
          </div>
          <pre className="p-6 bg-[#030712] text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
            <code>{compactCode}</code>
          </pre>
        </div>
      ) : (
        /* Privacy Matrix Table */
        <div className="cloud-card rounded-2xl p-6 sm:p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-slate-400">
                  <th className="pb-4">DATA ELEMENT</th>
                  <th className="pb-4">VISIBILITY / STORAGE</th>
                  <th className="pb-4">COMPACT TYPE</th>
                  <th className="pb-4">PURPOSE & SECURITY GUARANTEE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                <tr>
                  <td className="py-4 pr-4 font-mono font-semibold text-sky-300 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-sky-400" />
                    totalRegisteredUsers
                  </td>
                  <td className="py-4 pr-4 text-slate-300 font-mono text-xs">Public On-Chain</td>
                  <td className="py-4 pr-4 text-blue-300 font-mono text-xs">Counter</td>
                  <td className="py-4 pr-4 text-slate-400 text-xs">
                    Tracks total registered vault count across Midnight Network without identifying addresses.
                  </td>
                </tr>

                <tr>
                  <td className="py-4 pr-4 font-mono font-semibold text-sky-300 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-sky-400" />
                    totalShieldedStorageAllocated
                  </td>
                  <td className="py-4 pr-4 text-slate-300 font-mono text-xs">Public On-Chain</td>
                  <td className="py-4 pr-4 text-blue-300 font-mono text-xs">Counter</td>
                  <td className="py-4 pr-4 text-slate-400 text-xs">
                    Verifies aggregate global storage allocation in Gigabytes.
                  </td>
                </tr>

                <tr>
                  <td className="py-4 pr-4 font-mono font-semibold text-emerald-300 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    bonusNullifiers
                  </td>
                  <td className="py-4 pr-4 text-slate-300 font-mono text-xs">Public On-Chain Set</td>
                  <td className="py-4 pr-4 text-blue-300 font-mono text-xs">Set&lt;Bytes&lt;32&gt;&gt;</td>
                  <td className="py-4 pr-4 text-slate-400 text-xs">
                    Prevents double-claiming the 20GB faucet bonus. Contains blinded nullifiers; unlinkable to user secrets.
                  </td>
                </tr>

                <tr className="bg-sky-950/20">
                  <td className="py-4 pr-4 font-mono font-semibold text-sky-300 flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-sky-400" />
                    userSecret()
                  </td>
                  <td className="py-4 pr-4 text-sky-300 font-mono text-xs font-bold">Client Private Witness</td>
                  <td className="py-4 pr-4 text-sky-300 font-mono text-xs">Bytes&lt;32&gt;</td>
                  <td className="py-4 pr-4 text-slate-300 text-xs">
                    256-bit entropy kept strictly in local client memory. Used to derive nullifiers and prove circuit ownership. NEVER sent to nodes.
                  </td>
                </tr>

                <tr className="bg-sky-950/20">
                  <td className="py-4 pr-4 font-mono font-semibold text-sky-300 flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-sky-400" />
                    fileCommitmentSecret()
                  </td>
                  <td className="py-4 pr-4 text-sky-300 font-mono text-xs font-bold">Client Private Witness</td>
                  <td className="py-4 pr-4 text-sky-300 font-mono text-xs">Bytes&lt;32&gt;</td>
                  <td className="py-4 pr-4 text-slate-300 text-xs">
                    Key wrapping secret used to prove file quota ownership in zero-knowledge.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
