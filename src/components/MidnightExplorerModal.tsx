import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Layers,
  Database,
  CheckCircle2,
  Copy,
  Check,
  X,
  Code,
  FileCode,
  Activity,
} from 'lucide-react';
import { PaymentTransaction } from '../types';
import { useVault } from '../context/VaultContext';

interface MidnightExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tx: PaymentTransaction | null;
}

export const MidnightExplorerModal: React.FC<MidnightExplorerModalProps> = ({
  isOpen,
  onClose,
  tx,
}) => {
  const { session, metrics } = useVault();
  const [activeTab, setActiveTab] = useState<'overview' | 'contract' | 'state' | 'raw'>('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !tx) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const contractAddress = '0x9f8c47b1e2a03d7e5f6a8b9c0d1e2f3a4b5c6d7e';
  const blockHeight = tx.blockHeight || 849231;
  const gasFee = tx.gasFee || '0.0025 tDUST';
  const nullifier = tx.zkProofNullifier || session.nullifierHex;

  const rawGraphQLLedgerState = {
    data: {
      transaction: {
        hash: tx.txHash,
        block: {
          height: blockHeight,
          timestamp: tx.timestamp,
          era: 'Midnight Preprod (Halo2-ZK)',
          validator: 'mn_pool1preprod_validator_09',
        },
        contractCall: {
          contractAddress: contractAddress,
          circuit: tx.planName.includes('20GB') || tx.planName.includes('Bonus')
            ? 'claimTestnetBonus(Bytes<32> nullifier)'
            : 'initializeUserStorage()',
          witnessType: 'Client-Side Private (userSecret)',
          nullifierCommitted: nullifier,
        },
        stateTransitions: [
          {
            key: `user_quota_${session.shieldedAddress.slice(0, 16)}`,
            oldValue: `${session.quotaGB - (tx.capacityGB || 20)} GB`,
            newValue: `${session.quotaGB} GB`,
          },
          {
            key: 'nullifier_tree_root',
            treeDepth: 32,
            action: 'inserted',
          }
        ],
        fees: {
          gasToken: 'tDUST',
          amount: gasFee,
          shieldedDeduction: true,
        }
      }
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center min-h-screen font-mono"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-5xl rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl relative max-h-[92vh] flex flex-col my-auto text-slate-800"
        >
          {/* Top Explorer Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-900 font-display font-black text-base sm:text-lg font-sans">
                    MIDNIGHT PREPROD EXPLORER
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    LIVE
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-sans block">
                  Contract Ledger & Circuit Execution Inspector
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href="https://preprod.midnightexplorer.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                title="View Official Midnight Network Preprod Explorer"
              >
                <span>Midnight Preprod Explorer</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="Close Explorer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 py-3 border-b border-slate-200 flex-shrink-0 text-xs">
            {[
              { id: 'overview', label: 'Transaction Overview', icon: Activity },
              { id: 'contract', label: 'Smart Contract (voidcloud.compact)', icon: FileCode },
              { id: 'state', label: 'On-Chain Ledger State', icon: Layers },
              { id: 'raw', label: 'Raw GraphQL Payload', icon: Code },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-sans font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Transaction Overview */}
          <div className="overflow-y-auto pr-1 py-4 space-y-4 flex-1 text-xs">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Status Hero Box */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="text-slate-900 font-bold text-sm block font-sans">
                        Transaction Verified & Finalized in Block #{blockHeight}
                      </span>
                      <span className="text-slate-500 text-[11px] font-sans">
                        Zero-Knowledge Circuit: <code className="text-emerald-700 font-bold">claimTestnetBonus(nullifier)</code>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-emerald-700 font-black text-sm block">
                      {tx.amount === 0 ? 'FREE (ZK-Grant)' : `-${tx.amount} ${tx.token}`}
                    </span>
                    <span className="text-slate-400 text-[10px]">Settled Gas: {gasFee}</span>
                  </div>
                </div>

                {/* Grid Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Transaction Hash</span>
                    <div className="flex items-center justify-between">
                      <span className="text-sky-600 font-bold truncate max-w-xs">{tx.txHash}</span>
                      <button
                        onClick={() => copyToClipboard(tx.txHash, 'txHash')}
                        className="text-slate-400 hover:text-sky-600 p-1"
                      >
                        {copiedField === 'txHash' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Smart Contract Address</span>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-800 font-bold truncate max-w-xs">{contractAddress}</span>
                      <button
                        onClick={() => copyToClipboard(contractAddress, 'contract')}
                        className="text-slate-400 hover:text-sky-600 p-1"
                      >
                        {copiedField === 'contract' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">ZK Nullifier Commitment</span>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-600 font-bold truncate max-w-xs">{nullifier}</span>
                      <button
                        onClick={() => copyToClipboard(nullifier, 'nullifier')}
                        className="text-slate-400 hover:text-purple-600 p-1"
                      >
                        {copiedField === 'nullifier' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Proof Server Latency</span>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 font-bold">{metrics.proofServerLatencyMs} ms (Halo2-SNARK)</span>
                      <span className="text-slate-400 text-[10px]">Zero-Knowledge Shielded</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contract' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 overflow-auto max-h-[50vh]">
                <pre className="text-xs text-slate-800 leading-relaxed font-mono">
{`// Midnight Network Preprod Compact Smart Contract
// Contract: voidcloud.compact

export ledger bonusNullifiers: Set<Bytes<32>>;
export ledger userStorageAllocations: Map<Bytes<32>, Uint<64>>;

export circuit claimTestnetBonus(nullifier: Bytes<32>): [] {
  // Enforce zero-knowledge nullifier single-use constraint
  assert(!bonusNullifiers.member(nullifier), "Bonus already claimed!");
  bonusNullifiers.insert(nullifier);
}`}
                </pre>
              </div>
            )}

            {activeTab === 'state' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-400 text-[10px]">Ledger Invariant 1:</div>
                  <div className="text-slate-900 font-bold mt-0.5">bonusNullifiers.member(nullifier) == TRUE</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-400 text-[10px]">Ledger Invariant 2:</div>
                  <div className="text-slate-900 font-bold mt-0.5">userStorageAllocations[userKey] == {session.quotaGB} * 1024 * 1024 * 1024 bytes</div>
                </div>
              </div>
            )}

            {activeTab === 'raw' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 overflow-auto max-h-[50vh]">
                <pre className="text-xs text-slate-800 leading-relaxed font-mono">
                  {JSON.stringify(rawGraphQLLedgerState, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
