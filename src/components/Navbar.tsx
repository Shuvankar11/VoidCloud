import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { useWeb3Wallet } from '../context/WalletContext';
import { Cloud, LogOut, LogIn, Menu, X, Wallet, Sparkles, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { session } = useVault();
  const { user, setIsAuthModalOpen, signOut } = useAuth();
  const { wallet, setIsWalletModalOpen, setIsPricingModalOpen } = useWeb3Wallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#080D1A]/95 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo & Status */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 flex-shrink-0">
          <a href="#" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500/20 via-blue-600/20 to-emerald-500/20 border border-sky-500/40 flex items-center justify-center group-hover:border-sky-400 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all">
              <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-display font-bold text-base sm:text-lg tracking-wide text-white">VOID</span>
                <span className="font-display font-bold text-base sm:text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">CLOUD</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-slate-400 block hidden xs:block">Decentralized ZK Storage</span>
            </div>
          </a>

          {/* Midnight Status Pill */}
          <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#0E1424] border border-slate-700/80 text-slate-300 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Preprod Live</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs sm:text-sm font-medium text-slate-300 flex-shrink-0">
          <a href="#overview" className="hover:text-sky-400 transition-colors whitespace-nowrap">Overview</a>
          <a href="#storage" className="hover:text-sky-400 transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <span>Storage Quota</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300 font-mono">
              {session.quotaGB}GB
            </span>
          </a>
          <a href="#vault" className="hover:text-sky-400 transition-colors whitespace-nowrap">Object Vault</a>
          <a href="#features" className="hover:text-sky-400 transition-colors whitespace-nowrap">Architecture</a>
        </nav>

        {/* Right Actions: Upgrade + Web3 Wallet + User Account */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
          
          {/* Upgrade Storage Plan Button */}
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Upgrade</span>
          </button>

          {/* Web3 Wallet Connect Button */}
          {wallet.isConnected ? (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0E1424] border border-sky-500/50 hover:border-sky-400 text-sky-300 text-xs font-mono transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold">{wallet.balances.NIGHT} NIGHT</span>
            </button>
          ) : (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0E1424] hover:bg-[#141D30] border border-slate-700 hover:border-sky-500 text-slate-200 text-xs font-mono transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Wallet</span>
            </button>
          )}

          {/* User Account Button */}
          {user ? (
            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-[#0E1424] border border-slate-700 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs font-mono">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-[11px]">
                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </div>
              <span className="text-white font-semibold text-xs truncate max-w-[80px] sm:max-w-[120px]">
                {user.displayName || user.email.split('@')[0]}
              </span>
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="text-slate-400 hover:text-rose-400 transition-colors ml-1 p-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all hover:scale-105 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#080D1A] border-b border-slate-800 px-4 py-4 space-y-3 font-mono text-xs">
          <a
            href="#overview"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-sky-400 py-1"
          >
            Overview
          </a>
          <a
            href="#storage"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-sky-400 py-1"
          >
            Storage Quota ({session.quotaGB} GB)
          </a>
          <a
            href="#vault"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-sky-400 py-1"
          >
            Object Vault
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-sky-400 py-1"
          >
            Architecture
          </a>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsPricingModalOpen(true);
              }}
              className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold text-center"
            >
              Upgrade Storage (50GB - 500GB)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
