import React, { useState } from 'react';
import { useWeb3Wallet, STORAGE_PLANS } from '../context/WalletContext';
import { useVault } from '../context/VaultContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, X, Check, Sparkles, ArrowRight, Shield, RefreshCw, AlertCircle, Coins, CheckCircle2 } from 'lucide-react';
import { StoragePlan, BillingCycle } from '../types';

export const StoragePricingModal: React.FC = () => {
  const {
    wallet,
    isPricingModalOpen,
    setIsPricingModalOpen,
    setIsWalletModalOpen,
    purchaseStoragePlan,
  } = useWeb3Wallet();

  const { session, upgradeStorageQuota } = useVault();

  const [selectedPlan, setSelectedPlan] = useState<StoragePlan>(STORAGE_PLANS[0]);
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [paymentToken, setPaymentToken] = useState<'NIGHT' | 'tDUST' | 'ADA' | 'USDT' | 'ETH'>('NIGHT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successTx, setSuccessTx] = useState<string | null>(null);

  if (!isPricingModalOpen) return null;

  const currentPrice = selectedPlan.pricing[billing][paymentToken];
  const userBalance = wallet.balances[paymentToken] || 0;
  const isBalanceSufficient = userBalance >= currentPrice;

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="cloud-card w-full max-w-3xl rounded-3xl p-6 sm:p-8 border border-sky-500/40 shadow-2xl relative my-8"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              setIsPricingModalOpen(false);
              setSuccessTx(null);
              setError('');
            }}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center max-w-xl mx-auto mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0E1424] border border-sky-500/30 text-sky-300 text-xs font-mono mb-2">
              <HardDrive className="w-3.5 h-3.5" />
              <span>MAINNET & PREPROD EXPANSION TIERS</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Upgrade Cloud Storage Quota
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Current Active Storage: <span className="text-sky-400 font-bold font-mono">{session.quotaGB} GB</span> (Current Plan: {session.planName || 'Standard Free'})
            </p>
          </div>

          {/* Billing Cycle Selector */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#080D1A] p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 text-xs font-mono">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  billing === 'monthly'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly Plan
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  billing === 'yearly'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Yearly Plan</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  SAVE 20%
                </span>
              </button>
              <button
                onClick={() => setBilling('lifetime')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
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
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-3 mb-6">
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
              <button
                onClick={() => {
                  setIsPricingModalOpen(false);
                  setSuccessTx(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold text-xs font-mono mt-2"
              >
                Return to Cloud Vault
              </button>
            </div>
          ) : (
            <>
              {/* Storage Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {STORAGE_PLANS.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  const price = plan.pricing[billing][paymentToken];

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`rounded-2xl p-5 cursor-pointer transition-all border relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-b from-sky-950/40 to-[#080D1A] border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                          : 'bg-[#080D1A]/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute -top-2.5 right-4 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md">
                          {plan.badge}
                        </span>
                      )}

                      <div>
                        <span className="text-xs font-mono text-slate-400 block">{plan.name}</span>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className="text-3xl font-display font-extrabold text-white">
                            {plan.capacityGB}
                          </span>
                          <span className="text-sm font-bold text-sky-400">GB</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-sans min-h-[34px]">
                          {plan.description}
                        </p>

                        <div className="my-3 pt-3 border-t border-slate-800/80">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold font-mono text-white">
                              {price}
                            </span>
                            <span className="text-xs font-mono text-sky-300 font-semibold">{paymentToken}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              /{billing === 'monthly' ? 'mo' : billing === 'yearly' ? 'yr' : 'once'}
                            </span>
                          </div>
                        </div>

                        {/* Feature Checklist */}
                        <ul className="space-y-1.5 text-[11px] text-slate-300 font-sans">
                          {plan.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-center space-x-1.5">
                              <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/60">
                        <button
                          type="button"
                          className={`w-full py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                            isSelected
                              ? 'bg-sky-500 text-white shadow-md'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? 'Selected Plan' : 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Token Selector & Checkout Summary */}
              <div className="p-5 rounded-2xl bg-[#080D1A] border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      SELECT PAYMENT TOKEN:
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      Pay with Midnight native tokens, Cardano ADA, or stablecoins
                    </span>
                  </div>

                  {/* Token Options */}
                  <div className="flex flex-wrap gap-2">
                    {(['NIGHT', 'tDUST', 'ADA', 'USDT', 'ETH'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setPaymentToken(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
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
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs font-mono space-y-0.5 text-center sm:text-left">
                    <div className="text-slate-400">
                      Total Due: <span className="text-white font-bold">{currentPrice} {paymentToken}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Wallet Balance: <span className={isBalanceSufficient ? 'text-emerald-400' : 'text-rose-400'}>{userBalance} {paymentToken}</span>
                      {!wallet.isConnected && ' (Wallet Not Connected)'}
                    </div>
                  </div>

                  <button
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Confirming On-Chain...</span>
                      </>
                    ) : !wallet.isConnected ? (
                      <>
                        <span>Connect Wallet to Pay</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Pay {currentPrice} {paymentToken} & Upgrade</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
