import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { useWeb3Wallet } from '../context/WalletContext';
import {
  LogOut,
  LogIn,
  Menu,
  X,
  Wallet,
  Sparkles,
  Image as ImageIcon,
  HardDrive,
  History,
  Cpu
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { session, activeView, setActiveView } = useVault();
  const { user, setIsAuthModalOpen, signOut } = useAuth();
  const { wallet, setIsWalletModalOpen, setIsPricingModalOpen } = useWeb3Wallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (targetView: 'landing' | 'dashboard' | 'home' | 'gallery' | 'payments', hash?: string) => {
    setActiveView(targetView);
    setMobileMenuOpen(false);
    if ((targetView === 'home' || targetView === 'landing') && hash) {
      setTimeout(() => {
        const elem = document.querySelector(hash);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/85 border-b border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <button
            onClick={() => handleNavClick(user ? 'dashboard' : 'landing', '#overview')}
            className="flex items-center space-x-2.5 group text-left cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-sky-400/60 shadow-sm flex items-center justify-center group-hover:scale-105 transition-all flex-shrink-0 bg-white">
              <img src="/voidcloud-logo.jpg" alt="Void Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-display font-black text-base sm:text-lg tracking-wide text-slate-900">VOID</span>
                <span className="font-display font-black text-base sm:text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">CLOUD</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 hidden xs:block font-semibold">Midnight ZK Vault</span>
            </div>
          </button>
        </div>

        {/* Center: Navigation Links (Clean Light Glass UI) */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600 flex-shrink">
          {/* Overview / Landing Button */}
          <button
            onClick={() => handleNavClick('landing', '#overview')}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
              activeView === 'landing' || activeView === 'home'
                ? 'text-sky-600 bg-sky-50 font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Home
          </button>

          {/* Dedicated Vault Dashboard Button */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'dashboard'
                ? 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/30'
                : 'hover:text-slate-900 hover:bg-slate-100/80 text-slate-600'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Vault Dashboard</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeView === 'dashboard' ? 'bg-sky-700 text-white' : 'bg-sky-100 text-sky-700'}`}>
              {session.quotaGB}GB
            </span>
          </button>

          {/* Dedicated Media Gallery Button */}
          <button
            onClick={() => handleNavClick('gallery')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'gallery'
                ? 'bg-sky-500 text-white font-bold shadow-sm'
                : 'hover:text-slate-900 hover:bg-slate-100/80 text-slate-600'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Gallery</span>
          </button>

          {/* Dedicated History Ledger Button */}
          <button
            onClick={() => handleNavClick('payments')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeView === 'payments'
                ? 'bg-emerald-500 text-white font-bold shadow-sm'
                : 'hover:text-slate-900 hover:bg-slate-100/80 text-slate-600'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ledger History</span>
          </button>
        </nav>

        {/* Right Actions: Upgrade + Wallet + User Auth */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          
          {/* Upgrade Storage Plan Button */}
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Upgrade</span>
          </button>

          {/* Web3 Wallet Connect Button */}
          {wallet.isConnected ? (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300/80 text-slate-800 text-xs font-mono font-bold transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-[11px]">{wallet.balances.NIGHT} NIGHT</span>
            </button>
          ) : (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
            >
              <Wallet className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Wallet</span>
            </button>
          )}

          {/* User Account / Sign In Button (Matching Reference 1) */}
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1 text-xs font-semibold">
              <div className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-[10px]">
                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </div>
              <span className="text-slate-800 font-bold max-w-[80px] sm:max-w-[110px] truncate">
                {user.displayName || user.email.split('@')[0]}
              </span>
              <button
                onClick={() => {
                  signOut();
                  setActiveView('landing');
                }}
                title="Sign out"
                className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/25 transition-all hover:scale-105 whitespace-nowrap cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log in</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1.5 bg-white border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => handleNavClick('landing')}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-50 text-slate-800"
          >
            Home / Overview
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-50 text-sky-600 font-bold"
          >
            Vault Dashboard ({session.quotaGB} GB)
          </button>
          <button
            onClick={() => handleNavClick('gallery')}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-50 text-slate-800"
          >
            Media Gallery
          </button>
          <button
            onClick={() => handleNavClick('payments')}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-50 text-emerald-600 font-bold"
          >
            Ledger History
          </button>
        </div>
      )}
    </header>
  );
};
