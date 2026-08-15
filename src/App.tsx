import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { WalletProvider } from './context/WalletContext';
import { CustomCursor } from './components/CustomCursor';
import { TopMarquee } from './components/TopMarquee';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StorageVisualizer } from './components/StorageVisualizer';
import { ShieldedFileManager } from './components/ShieldedFileManager';
import { FeatureGrid } from './components/FeatureGrid';
import { Footer } from './components/Footer';
import { ZKProofModal } from './components/ZKProofModal';
import { AuthModal } from './components/AuthModal';
import { WalletConnectModal } from './components/WalletConnectModal';
import { StoragePricingModal } from './components/StoragePricingModal';
import { TelegramSettingsModal } from './components/TelegramSettingsModal';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <VaultProvider>
        <WalletProvider>
          <div className="min-h-screen bg-[#030712] text-slate-100 relative selection:bg-sky-500 selection:text-black">
            {/* Futuristic High-Visibility Cloud Cursor */}
            <CustomCursor />

            {/* Top Live Midnight Network Status Marquee */}
            <TopMarquee />

            {/* Navigation Bar with User Profile, Web3 Wallet & Auth Status */}
            <Navbar />

            {/* Main Core Cloud Storage Sections */}
            <main className="space-y-6">
              <HeroSection />
              <StorageVisualizer />
              <ShieldedFileManager />
              <FeatureGrid />
            </main>

            {/* Cloud Infrastructure Footer */}
            <Footer />

            {/* Real-time ZK Proof Synthesizer Modal */}
            <ZKProofModal />

            {/* User Account & Authentication Modal */}
            <AuthModal />

            {/* Web3 Multi-Wallet Connect Modal (Midnight Lace / MetaMask) */}
            <WalletConnectModal />

            {/* Storage Quota Upgrade & Multi-Token Pricing Modal (50GB - 500GB) */}
            <StoragePricingModal />

            {/* Telegram Private Channel Storage Settings Modal */}
            <TelegramSettingsModal />
          </div>
        </WalletProvider>
      </VaultProvider>
    </AuthProvider>
  );
};

export default App;
