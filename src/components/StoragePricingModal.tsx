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

  const [selectedPlan, setSelectedPlan] = useState<StoragePlan>(() => {
    return session.bonusClaimed ? STORAGE_PLANS[1] : STORAGE_PLANS[0];
  });
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [paymentToken, setPaymentToken] = useState<'NIGHT' | 'tDUST' | 'ADA' | 'USDT' | 'ETH'>('NIGHT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successTx, setSuccessTx] = useState<string | null>(null);

  useEffect(() => {
    if (session.bonusClaimed && selectedPlan.id === 'plan_20gb') {
      setSelectedPlan(STORAGE_PLANS[1]);
    }
  }, [session.bonusClaimed, isPricingModalOpen]);

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

    if (selectedPlan.id === 'plan_20gb' && session.bonusClaimed) {
      setError('You have already claimed this 1-time 20GB Testnet bonus!');
      return;
    }

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
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-5xl rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl relative max-h-[92vh] flex flex-col my-auto text-slate-800"
        >
          {/* Header Bar with Back & Close */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Vault</span>
            </button>

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold">
              <HardDrive className="w-3.5 h-3.5" />
              <span>STORAGE EXPANSION TIERS</span>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto pr-1 space-y-5 flex-1">
            {/* Title & Quota Info */}
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">
                Upgrade Cloud Storage Quota
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Current Storage: <span className="text-sky-600 font-bold font-mono">{session.quotaGB} GB</span> • Active Plan: <span className="text-slate-700 font-bold">{session.planName || '20GB Free Baseline'}</span>
              </p>
            </div>

            {/* Billing Cycle Selector */}
            <div className="flex justify-center">
              <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-1 text-xs">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    billing === 'monthly'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    billing === 'yearly'
                      ? 'bg-emerald-500 text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>Yearly</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-700 text-white font-bold">
                    SAVE 20%
                  </span>
                </button>
                <button
                  onClick={() => setBilling('lifetime')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                    billing === 'lifetime'
                      ? 'bg-sky-500 text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>1-Time Lifetime</span>
                </button>
              </div>
            </div>

            {/* Success Message Banner */}
            {successTx ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-slate-900 font-display">Storage Expanded to {selectedPlan.capacityGB} GB!</h4>
                <p className="text-xs text-slate-600">
                  On-chain payment verified on Midnight Preprod. Transaction Hash:
                </p>
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-emerald-600 font-bold break-all max-w-md mx-auto">
                  {successTx}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      handleClose();
                      setActiveView('dashboard');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Open Storage Vault
                  </button>
                  <button
                    onClick={() => {
                      handleClose();
                      setActiveView('payments');
                    }}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    View Ledger Receipt
                  </button>
                </div>
              </div>
            ) : (
              /* Plans Grid */
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {STORAGE_PLANS.map((plan) => {
                  const isAlreadyClaimedBonus = plan.id === 'plan_20gb' && session.bonusClaimed;
                  const isSelected = selectedPlan.id === plan.id && !isAlreadyClaimedBonus;
                  const price = plan.pricing[billing][paymentToken];

                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        if (!isAlreadyClaimedBonus) {
                          setSelectedPlan(plan);
                        }
                      }}
                      className={`relative rounded-2xl p-5 transition-all flex flex-col justify-between border ${
                        isAlreadyClaimedBonus
                          ? 'border-emerald-300 bg-emerald-50/40 opacity-90 cursor-default ring-1 ring-emerald-200'
                          : isSelected
                          ? 'border-sky-500 bg-sky-50/70 shadow-lg ring-2 ring-sky-200 cursor-pointer'
                          : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      {isAlreadyClaimedBonus ? (
                        <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] shadow-sm uppercase">
                          ✓ 1-Time Claimed
                        </div>
                      ) : plan.badge ? (
                        <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-[9px] shadow-sm uppercase">
                          {plan.badge}
                        </div>
                      ) : null}

                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          {plan.name}
                        </div>
                        <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                          {plan.capacityGB} <span className="text-sm font-semibold text-slate-500">GB</span>
                        </div>

                        {/* Price */}
                        <div className="my-3 p-3 rounded-xl bg-white border border-slate-200">
                          <div className="text-lg font-black text-slate-900 font-mono">
                            {price} <span className="text-xs font-bold text-sky-600">{paymentToken}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            /{billing === 'lifetime' ? 'forever' : billing}
                          </div>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {plan.features.map((f, idx) => (
                            <li key={idx} className="flex items-center space-x-1.5">
                              <Check className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                              <span className="text-[11px]">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Select / Claimed Button */}
                      {isAlreadyClaimedBonus ? (
                        <div className="w-full mt-4 py-2 rounded-xl text-xs font-bold text-center bg-emerald-100 text-emerald-700 border border-emerald-200">
                          ✓ Claimed ({session.quotaGB}GB Active)
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(plan);
                          }}
                          className={`w-full mt-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-500 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Choose Tier'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Payment Currency & Execution Box */}
            {!successTx && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Select Payment Token</h4>
                    <p className="text-xs text-slate-500">
                      Settled trustlessly via Midnight Preprod Compact Smart Contracts.
                    </p>
                  </div>

                  {/* Token selector pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {(['NIGHT', 'tDUST', 'ADA', 'USDT', 'ETH'] as const).map((token) => (
                      <button
                        key={token}
                        onClick={() => setPaymentToken(token)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          paymentToken === token
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {token}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Purchase Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500">
                    <span>Balance: </span>
                    <span className="font-bold text-slate-800 font-mono">
                      {userBalance} {paymentToken}
                    </span>
                    {!isBalanceSufficient && (
                      <span className="text-rose-500 ml-2 font-semibold">
                        (Insufficient - use Faucet)
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Synthesizing ZK Transaction...</span>
                      </>
                    ) : (
                      <>
                        <span>Upgrade to {selectedPlan.capacityGB}GB for {currentPrice} {paymentToken}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
