import React from 'react';
import { useVault } from '../context/VaultContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cpu, RefreshCw, CheckCircle2, X, Cloud } from 'lucide-react';

export const ZKProofModal: React.FC = () => {
  const { proofModalOpen, setProofModalOpen, proofSteps, isGeneratingProof } = useVault();

  if (!proofModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="cloud-card w-full max-w-xl rounded-2xl p-6 sm:p-8 border border-sky-500/40 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Zero-Knowledge Proof Engine
                </h3>
                <span className="text-xs font-mono text-sky-400">
                  Target Circuit: voidcloud.compact :: claimTestnetBonus
                </span>
              </div>
            </div>

            {!isGeneratingProof && (
              <button
                onClick={() => setProofModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Steps Pipeline */}
          <div className="space-y-3.5 font-mono text-xs">
            {proofSteps.map((step) => {
              const isDone = step.status === 'completed';
              const isCurrent = step.status === 'processing';

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                      : isCurrent
                      ? 'bg-sky-950/30 border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.2)] text-white'
                      : 'bg-[#080D1A] border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">
                          {step.id}
                        </span>
                      )}
                      <span className="font-semibold">{step.title}</span>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                        isDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : isCurrent
                          ? 'bg-sky-950 text-sky-300 border border-sky-500/30 animate-pulse'
                          : 'text-slate-600'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-400 pl-6.5">
                    {step.description}
                  </p>

                  {step.hash && (
                    <div className="mt-2 pl-6.5 text-[10px] text-sky-300 font-mono break-all bg-black/40 p-1.5 rounded">
                      Hash: {step.hash}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Midnight Network Halo2 Verification Key</span>
            </div>

            {!isGeneratingProof && (
              <button
                onClick={() => setProofModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all"
              >
                Done
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
