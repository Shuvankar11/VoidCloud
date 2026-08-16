import React, { useState, useEffect } from 'react';
import { useWeb3Wallet, STORAGE_PLANS } from '../context/WalletContext';
import { useVault } from '../context/VaultContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, X, Check, Sparkles, ArrowRight, ArrowLeft, Shield, RefreshCw, AlertCircle, Coins, CheckCircle2 } from 'lucide-react';
import { StoragePlan, BillingCycle } from '../types';

export const StoragePricingModal: React.FC = () => {
  const {
    wallet,
    isPricingModalOpen,
    setIsPricingModalOpen,
    setIsWalletModalOpen,
    purchaseStoragePlan,
  } = useWeb3Wallet();

  const { session, upgradeStorageQuota, setActiveView } = useVault();

  const [selectedPlan, setSelectedPlan] = useState<StoragePlan>(STORAGE_PLANS[0]);
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [paymentToken, setPaymentToken] = useState<'NIGHT' | 'tDUST' | 'ADA' | 'USDT' | 'ETH'>('NIGHT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successTx, setSuccessTx] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPricingModalOpen) {
        setIsPricingModalOpen(false);
        setSuccessTx(null);
        setError('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPricingModalOpen, setIsPricingModalOpen]);

  if (!isPricingModalOpen) return null;

  const currentPrice = selectedPlan.pricing[billing][paymentToken];
  const userBalance = wallet.balances[paymentToken] || 0;
  const isBalanceSufficient = userBalance >= currentPrice;

  const handleClose = () => {
    setIsPricingModalOpen(false);
    setSuccessTx(null);
    setError('');
  };

  const handlePurchase = async () => {
    setError('');
    setSuccessTx(null);

    if (!wallet.isConnected) {
      setIsWalletModalOpen(true);
      return;
    }

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 800));

    const result = await purchaseStoragePlan(selectedPlan, billing, paymentToken);

    if (result.success && result.txHash) {
      upgradeStorageQuota(selectedPlan.capacityGB, selectedPlan.name);
      setSuccessTx(result.txHash);
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    } else {
      setError(result.error || 'Payment execution failed');
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="cloud-card w-full max-w-5xl rounded-3xl p-5 sm:p-7 border border-sky-500/40 shadow-2xl relative max-h-[92vh] flex flex-col my-auto"
        >
          {/* Header Bar with Back & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-sky-300 transition-colors px-2.5 py-1.5 rounded-xl hover:bg-slate-800/60"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Vault</span>
            </button>

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0E1424] border border-sky-500/30 text-sky-300 text-xs font-mono">
              <HardDrive className="w-3.5 h-3.5" />
              <span>STORAGE EXPANSION TIERS</span>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto pr-1 space-y-5 flex-1">
            {/* Title & Quota Info */}
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
                Upgrade Cloud Storage Quota
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Current Storage: <span className="text-sky-400 font-bold font-mono">{session.quotaGB} GB</span> • Active Plan: <span className="text-slate-300 font-mono">{session.planName || '20GB Standard Tier'}</span>
              </p>
            </div>

            {/* Billing Cycle Selector */}
            <div className="flex justify-center">
              <div className="bg-[#080D1A] p-1 rounded-2xl border border-slate-800 flex items-center gap-1 text-xs font-mono">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    billing === 'monthly'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    billing === 'yearly'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Yearly</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                    SAVE 20%
                  </span>
                </button>
                <button
                  onClick={() => setBilling('lifetime')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    billing === 'lifetime'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>1-Time Lifetime</span>
                </button>
              </div>
            </div>

            {/* Success Message Banner */}
            {successTx ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-white font-display">Storage Expanded to {selectedPlan.capacityGB} GB!</h4>
                <p className="text-xs text-slate-300 font-mono">
                  On-chain payment verified on Midnight Preprod. Transaction Hash:
                </p>
                <div className="p-2 rounded-xl bg-[#080D1A] border border-slate-800 text-[11px] font-mono text-emerald-400 break-all max-w-md mx-auto">
                  {successTx}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs font-mono"
                  >
                    Return to Cloud Vault
                  </button>
                  <button
                    onClick={() => {
                      handleClose();
                      setActiveView('payments');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold text-xs font-mono shadow-md"
                  >
                    View in Payment History →
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 4 Storage Plan Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {STORAGE_PLANS.map((plan) => {
                    const isSelected = selectedPlan.id === plan.id;
                    const price = plan.pricing[billing][paymentToken];

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`rounded-2xl p-4 cursor-pointer transition-all border relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-gradient-to-b from-sky-950/50 to-[#080D1A] border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)] ring-1 ring-sky-400/50'
                            : 'bg-[#080D1A]/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {plan.badge && (
                          <span className="absolute -top-2.5 right-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md">
                            {plan.badge}
                          </span>
                        )}

                        <div>
                          <span className="text-[11px] font-mono text-slate-400 block">{plan.name}</span>
                          <div className="flex items-baseline space-x-1 mt-0.5">
                            <span className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                              {plan.capacityGB}
                            </span>
                            <span className="text-xs font-bold text-sky-400">GB</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans min-h-[28px]">
                            {plan.description}
                          </p>

                          <div className="my-2.5 pt-2.5 border-t border-slate-800/80">
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold font-mono text-white">
                                {price}
                              </span>
                              <span className="text-xs font-mono text-sky-300 font-semibold">{paymentToken}</span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                /{billing === 'monthly' ? 'mo' : billing === 'yearly' ? 'yr' : 'once'}
                              </span>
                            </div>
                          </div>

                          {/* Feature Checklist */}
                          <ul className="space-y-1 text-[10px] text-slate-300 font-sans">
                            {plan.features.slice(0, 3).map((f, i) => (
                              <li key={i} className="flex items-center space-x-1.5">
                                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span className="truncate">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                          <button
                            type="button"
                            className={`w-full py-1.5 rounded-xl text-[11px] font-mono font-semibold transition-all ${
                              isSelected
                                ? 'bg-sky-500 text-white shadow-md'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Payment Token Selector & Checkout Summary */}
                <div className="p-4 rounded-2xl bg-[#080D1A] border border-slate-800 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-400" />
                        SELECT PAYMENT TOKEN:
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Pay with Midnight tokens (tNIGHT, tDUST), Cardano ADA, or stablecoins
                      </span>
                    </div>

                    {/* Token Options */}
                    <div className="flex flex-wrap gap-1.5">
                      {(['NIGHT', 'tDUST', 'ADA', 'USDT', 'ETH'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setPaymentToken(t)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition-all ${
                            paymentToken === t
                              ? 'bg-sky-500 text-white shadow-md'
                              : 'bg-[#0E1424] text-slate-400 hover:text-slate-200 border border-slate-700/80'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checkout Bar */}
                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs font-mono space-y-0.5 text-center sm:text-left">
                      <div className="text-slate-400">
                        Total Due: <span className="text-white font-bold">{currentPrice} {paymentToken}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Wallet Balance: <span className={isBalanceSufficient ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{userBalance} {paymentToken}</span>
                        {!wallet.isConnected && ' (Wallet Not Connected)'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={handleClose}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handlePurchase}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Confirming On-Chain...</span>
                          </>
                        ) : !wallet.isConnected ? (
                          <>
                            <span>Connect Wallet to Pay</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Pay {currentPrice} {paymentToken} & Upgrade</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
