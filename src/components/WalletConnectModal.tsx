import React, { useState, useEffect } from 'react';
import { useWeb3Wallet } from '../context/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Coins, RefreshCw, Copy } from 'lucide-react';

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

  const handleSync = async () => {
    setIsSyncing(true);
    await syncLiveBalance();
    setTimeout(() => setIsSyncing(false), 500);
  };

  useEffect(() => {
    if (wallet.isConnected && wallet.walletName === 'Midnight Lace' && wallet.balances.NIGHT === 0) {
      syncLiveBalance();
    }
  }, [wallet.isConnected, wallet.walletName, wallet.balances.NIGHT, syncLiveBalance]);

  if (!isWalletModalOpen) return null;

  const handleConnect = async (walletName: 'Midnight Lace' | 'MetaMask' | 'Coinbase' | 'Phantom') => {
    setConnecting(walletName);
    try {
      await connectWallet(walletName);
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="cloud-card w-full max-w-lg rounded-2xl p-6 sm:p-8 border border-sky-500/40 shadow-2xl relative overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsWalletModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 via-blue-600/20 to-emerald-500/20 border border-sky-500/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
              <Wallet className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white tracking-tight">
              {wallet.isConnected ? 'Connected Web3 Wallet' : 'Connect Web3 Wallet'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Connect your Midnight Lace or EVM wallet to purchase storage tiers and pay with NIGHT, tDUST, and stablecoins.
            </p>
          </div>

          {wallet.isConnected ? (
            /* Connected Wallet Details & Balances */
            <div className="space-y-5">
              {/* Address Card */}
              <div className="p-4 rounded-xl bg-[#080D1A] border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Wallet Provider:</span>
                  <span className="text-sky-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {wallet.walletName} ({wallet.network})
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Address:</span>
                  <button
                    onClick={copyAddress}
                    className="text-slate-300 hover:text-sky-400 flex items-center gap-1 transition-colors font-mono font-semibold"
                    title="Click to copy full address"
                  >
                    <span>{wallet.address?.slice(0, 14)}...{wallet.address?.slice(-8)}</span>
                    {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/50 flex items-center justify-between">
                  <span>Authorized by Lace Extension</span>
                  <span className="text-emerald-400 font-semibold">Active Session</span>
                </div>
              </div>

              {/* Token Balances Grid */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    TOKEN BALANCES
                  </span>
                  <button
                    onClick={handleSync}
                    className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                    title="Sync live balance from Lace"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Lace Balance'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#080D1A] border border-sky-500/40 text-center shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                    <span className="text-[10px] font-mono text-sky-300 block font-bold">tNIGHT (UNSHIELDED)</span>
                    <span className="text-base font-bold text-white font-mono">{wallet.balances.NIGHT.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-emerald-400 block font-semibold">tDUST (SHIELDED)</span>
                    <span className="text-base font-bold text-white font-mono">{wallet.balances.tDUST.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-blue-400 block font-semibold">ADA</span>
                    <span className="text-base font-bold text-white font-mono">{wallet.balances.ADA.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-emerald-300 block font-semibold">USDT</span>
                    <span className="text-base font-bold text-white font-mono">${wallet.balances.USDT.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800 text-center col-span-2 sm:col-span-2">
                    <span className="text-[10px] font-mono text-purple-400 block font-semibold">ETH</span>
                    <span className="text-base font-bold text-white font-mono">{wallet.balances.ETH} ETH</span>
                  </div>
                </div>
              </div>

              {/* Faucet Claim Section */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-blue-950/30 to-emerald-950/40 border border-sky-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-sky-300">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold">MIDNIGHT PREPROD FAUCET</span>
                  </div>
                  <a
                    href="https://faucet.preprod.midnight.network/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-sky-400 hover:text-sky-300 underline font-mono flex items-center gap-0.5"
                  >
                    <span>Official Faucet</span>
                    <span>↗</span>
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Claim instant testnet tokens for unshielded NIGHT and shielded tDUST storage payments:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => claimTestnetTokens('NIGHT')}
                    className="px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-500/50 text-sky-300 text-xs font-mono transition-colors font-semibold"
                  >
                    +500 NIGHT (Unshielded)
                  </button>
                  <button
                    onClick={() => claimTestnetTokens('tDUST')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-mono transition-colors font-semibold"
                  >
                    +200 tDUST (Shielded)
                  </button>
                  <button
                    onClick={() => claimTestnetTokens('USDT')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-mono transition-colors"
                  >
                    +100 USDT
                  </button>
                </div>
              </div>

              {/* Disconnect */}
              <button
                onClick={disconnectWallet}
                className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 font-mono text-xs font-semibold transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            /* Wallet Provider Selection List */
            <div className="space-y-3">
              {/* Midnight Lace Wallet (Recommended) */}
              <button
                onClick={() => handleConnect('Midnight Lace')}
                disabled={!!connecting}
                className="w-full p-4 rounded-xl bg-[#080D1A] hover:bg-[#0E1424] border border-sky-500/40 hover:border-sky-400 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white text-sm">Midnight Lace Wallet</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                        NATIVE
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block font-mono">
                      Official Midnight Preprod ZK Wallet (Select Cardano #0 to authorize)
                    </span>
                  </div>
                </div>
                {connecting === 'Midnight Lace' ? (
                  <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                )}
              </button>

              {/* MetaMask */}
              <button
                onClick={() => handleConnect('MetaMask')}
                disabled={!!connecting}
                className="w-full p-4 rounded-xl bg-[#080D1A] hover:bg-[#0E1424] border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.5 12l-3.5-8.5-6 4-6-4L2.5 12l9.5 8.5L21.5 12z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm block">MetaMask</span>
                    <span className="text-xs text-slate-400 block font-mono">EVM & Multi-Chain Wallet</span>
                  </div>
                </div>
                {connecting === 'MetaMask' ? (
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                )}
              </button>

              {/* Phantom */}
              <button
                onClick={() => handleConnect('Phantom')}
                disabled={!!connecting}
                className="w-full p-4 rounded-xl bg-[#080D1A] hover:bg-[#0E1424] border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Wallet className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm block">Phantom Wallet</span>
                    <span className="text-xs text-slate-400 block font-mono">Multi-Token Crypto Wallet</span>
                  </div>
                </div>
                {connecting === 'Phantom' ? (
                  <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                )}
              </button>

              {/* Coinbase Wallet */}
              <button
                onClick={() => handleConnect('Coinbase')}
                disabled={!!connecting}
                className="w-full p-4 rounded-xl bg-[#080D1A] hover:bg-[#0E1424] border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm block">Coinbase Wallet</span>
                    <span className="text-xs text-slate-400 block font-mono">Self-Custody Web3 App</span>
                  </div>
                </div>
                {connecting === 'Coinbase' ? (
                  <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
