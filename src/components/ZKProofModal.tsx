import React from 'react';
import { useVault } from '../context/VaultContext';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle2, X, Cloud } from 'lucide-react';

export const ZKProofModal: React.FC = () => {
  const { proofModalOpen, setProofModalOpen, proofSteps, isGeneratingProof } = useVault();

  if (!proofModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-xl rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl relative overflow-hidden text-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-600 shadow-xs">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-slate-900">
                  Zero-Knowledge Proof Engine
                </h3>
                <span className="text-xs font-mono text-sky-600 font-bold">
                  Circuit: voidcloud.compact :: claimTestnetBonus
                </span>
              </div>
            </div>

            {!isGeneratingProof && (
              <button
                onClick={() => setProofModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Steps Pipeline */}
          <div className="space-y-3 font-mono text-xs">
            {proofSteps.map((step) => {
              const isDone = step.status === 'completed';
              const isCurrent = step.status === 'processing';

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-200 text-slate-800'
                      : isCurrent
                      ? 'bg-sky-50 border-sky-300 shadow-sm text-slate-900 ring-2 ring-sky-100'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-sky-600 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                      )}
                      <span className="font-bold text-slate-900 font-sans">{step.title}</span>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-700'
                          : isCurrent
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans mt-1 ml-6.5">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
