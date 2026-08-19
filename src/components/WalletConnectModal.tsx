import React, { useState } from 'react';
import { useWeb3Wallet } from '../context/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Coins, RefreshCw, Copy, Check } from 'lucide-react';

export const WalletConnectModal: React.FC = () => {
  const {
    wallet,
    isWalletModalOpen,
    setIsWalletModalOpen,
    connectWallet,
    disconnectWallet,
    claimTestnetTokens,
    syncLiveBalance,
  } = useWeb3Wallet();

  const [connecting, setConnecting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isLaceDetected = typeof window !== 'undefined' && !!((window as any).midnight?.lace || (window as any).cardano?.lace);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncLiveBalance();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleConnect = async (walletName: 'Midnight Lace' | 'MetaMask' | 'Coinbase' | 'Phantom', allowFallback: boolean = false) => {
    setConnecting(walletName);
    try {
      await connectWallet(walletName, allowFallback);
    } catch (e) {
      console.warn('Connect wallet error:', e);
    } finally {
      setConnecting(null);
    }
  };

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isWalletModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl relative overflow-hidden text-slate-800"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsWalletModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">
              {wallet.isConnected ? 'Connected Web3 Wallet' : 'Connect Web3 Wallet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Connect your Midnight Lace or EVM wallet to purchase storage tiers and pay with NIGHT, tDUST, and stablecoins.
            </p>
          </div>

          {wallet.isConnected ? (
            /* Connected Wallet Details & Balances */
            <div className="space-y-5">
              {/* Address Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Wallet Provider:</span>
                  <span className="text-slate-900 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {wallet.walletName} ({wallet.network})
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/80">
                  <span className="text-slate-500">Address:</span>
                  <button
                    onClick={copyAddress}
                    className="text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors font-mono font-bold cursor-pointer"
                    title="Click to copy full address"
                  >
                    <span>{wallet.address?.slice(0, 14)}...{wallet.address?.slice(-8)}</span>
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Balances Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>Token Balances</span>
                  </span>
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="text-sky-600 hover:text-sky-700 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Balance</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* NIGHT */}
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-center">
                    <div className="text-[10px] font-bold text-sky-700 uppercase">tNIGHT</div>
                    <div className="text-sm sm:text-base font-black text-slate-900 font-mono mt-0.5">
                      {wallet.balances.NIGHT.toLocaleString()}
                    </div>
                  </div>

                  {/* tDUST */}
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-center">
                    <div className="text-[10px] font-bold text-purple-700 uppercase">tDUST</div>
                    <div className="text-sm sm:text-base font-black text-slate-900 font-mono mt-0.5">
                      {wallet.balances.tDUST.toLocaleString()}
                    </div>
                  </div>

                  {/* ADA */}
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                    <div className="text-[10px] font-bold text-blue-700 uppercase">ADA</div>
                    <div className="text-sm sm:text-base font-black text-slate-900 font-mono mt-0.5">
                      {wallet.balances.ADA}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {/* USDT */}
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase">USDT</div>
                    <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                      ${wallet.balances.USDT}
                    </div>
                  </div>

                  {/* ETH */}
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                    <div className="text-[10px] font-bold text-indigo-700 uppercase">ETH</div>
                    <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                      {wallet.balances.ETH} ETH
                    </div>
                  </div>
                </div>
              </div>

              {/* Testnet Faucet Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    <span>Midnight Preprod Faucet</span>
                  </span>
                  <a
                    href="https://docs.midnight.network"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-sky-600 hover:underline font-semibold"
                  >
                    Docs ↗
                  </a>
                </div>
                <p className="text-[11px] text-slate-500">
                  Claim testnet tokens to test zero-knowledge encrypted uploads and quota purchases:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => claimTestnetTokens('NIGHT')}
                    className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    +500 NIGHT
                  </button>
                  <button
                    onClick={() => claimTestnetTokens('tDUST')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    +200 tDUST
                  </button>
                  <button
                    onClick={() => claimTestnetTokens('USDT')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    +100 USDT
                  </button>
                </div>
              </div>

              {/* Disconnect Wallet */}
              <button
                onClick={disconnectWallet}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            /* Wallet Provider Selection List */
            <div className="space-y-3">
              {/* Midnight Lace Option */}
              <button
                onClick={() => handleConnect('Midnight Lace', true)}
                disabled={connecting !== null}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    N
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>Midnight Lace Wallet</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                        RECOMMENDED
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {isLaceDetected ? 'Extension detected' : 'Native Midnight Preprod ZK Wallet'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* MetaMask Option */}
              <button
                onClick={() => handleConnect('MetaMask')}
                disabled={connecting !== null}
                className="w-full p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                    🦊
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">MetaMask</div>
                    <div className="text-xs text-slate-500">Connect EVM compatible wallet</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Phantom Option */}
              <button
                onClick={() => handleConnect('Phantom')}
                disabled={connecting !== null}
                className="w-full p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                    👻
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Phantom Wallet</div>
                    <div className="text-xs text-slate-500">Multi-chain Web3 wallet</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
