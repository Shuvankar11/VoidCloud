import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { VaultProvider, useVault } from './context/VaultContext';
import { WalletProvider } from './context/WalletContext';
import { CustomCursor } from './components/CustomCursor';
import { TopMarquee } from './components/TopMarquee';
import { Navbar } from './components/Navbar';
import { useAuth } from './context/AuthContext';
import { HeroLanding3D } from './components/HeroLanding3D';
import { StorageVaultDashboard } from './components/StorageVaultDashboard';
import { YetiAuthModal } from './components/YetiAuthModal';
import { MediaGallery } from './components/MediaGallery';
import { FeatureGrid } from './components/FeatureGrid';
import { Footer } from './components/Footer';
import { ZKProofModal } from './components/ZKProofModal';
import { WalletConnectModal } from './components/WalletConnectModal';
import { StoragePricingModal } from './components/StoragePricingModal';
import { TelegramSettingsModal } from './components/TelegramSettingsModal';
import { FileViewerModal } from './components/FileViewerModal';
import { PaymentHistory } from './components/PaymentHistory';
import { ZKReceiptModal } from './components/ZKReceiptModal';
import { CompactContractViewer } from './components/CompactContractViewer';
import { MidnightExplorerModal } from './components/MidnightExplorerModal';
import { useWeb3Wallet } from './context/WalletContext';

const GlobalFileViewer: React.FC = () => {
  const { activePreviewFile, setActivePreviewFile, files } = useVault();
  if (!activePreviewFile) return null;

  const activeFiles = files.filter((f) => f.status === 'shielded');
  const currentIndex = activeFiles.findIndex((f) => f.id === activePreviewFile.id);
  const hasNext = currentIndex >= 0 && currentIndex < activeFiles.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNavigate = (direction: 'next' | 'prev') => {
    if (direction === 'next' && hasNext) {
      setActivePreviewFile(activeFiles[currentIndex + 1]);
    } else if (direction === 'prev' && hasPrev) {
      setActivePreviewFile(activeFiles[currentIndex - 1]);
    }
  };

  return (
    <FileViewerModal
      file={activePreviewFile}
      onClose={() => setActivePreviewFile(null)}
      onNavigate={handleNavigate}
      hasNext={hasNext}
      hasPrev={hasPrev}
    />
  );
};

const AppContent: React.FC = () => {
  const { activeView, setActiveView } = useVault();
  const { user, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  const { isExplorerModalOpen, setIsExplorerModalOpen, selectedExplorerTx, setSelectedExplorerTx } = useWeb3Wallet();

  const isDashboardView = activeView === 'dashboard' || (Boolean(user) && activeView !== 'landing' && activeView !== 'gallery' && activeView !== 'payments');

  const handleStartJourney = () => {
    if (user) {
      setActiveView('dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-slate-800 relative selection:bg-sky-500 selection:text-white font-sans">
      {/* Futuristic High-Visibility Cloud Cursor */}
      <CustomCursor />

      {/* Top Live Midnight Network Status Marquee */}
      <TopMarquee />

      {/* Navigation Bar with User Profile, Web3 Wallet & Auth Status */}
      <Navbar />

      {/* Conditional Page Views: Dedicated Media Vault VS. Payment History VS. Dedicated Dashboard VS. Hero Landing */}
      <main className="space-y-0">
        {activeView === 'gallery' ? (
          <MediaGallery />
        ) : activeView === 'payments' ? (
          <PaymentHistory />
        ) : isDashboardView ? (
          /* DEDICATED STORAGE VAULT DASHBOARD VIEW (Reference 3 & 4) */
          <StorageVaultDashboard />
        ) : (
          /* PURE CLEAN HERO LANDING VIEW (Reference 1) */
          <HeroLanding3D onStartJourney={handleStartJourney} />
        )}
      </main>

      {/* Cloud Infrastructure Footer */}
      <Footer />

      {/* Interactive Cursor-Reactive Yeti Authentication Modal (Reference 2) */}
      <YetiAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Real-time ZK Proof Synthesizer Modal */}
      <ZKProofModal />

      {/* Web3 Multi-Wallet Connect Modal (Midnight Lace / MetaMask) */}
      <WalletConnectModal />

      {/* Storage Quota Upgrade & Multi-Token Pricing Modal (50GB - 500GB) */}
      <StoragePricingModal />

      {/* Telegram Private Channel Storage Settings Modal */}
      <TelegramSettingsModal />

      {/* Cryptographic ZK Proof & Payment Transaction Receipt Modal */}
      <ZKReceiptModal />

      {/* Midnight Network Preprod Explorer & Contract Inspector Modal */}
      <MidnightExplorerModal
        isOpen={isExplorerModalOpen}
        onClose={() => {
          setIsExplorerModalOpen(false);
          setSelectedExplorerTx(null);
        }}
        tx={selectedExplorerTx}
      />

      {/* Cyberpunk Media Lightbox & File Viewer Modal for Photos/Videos/Docs */}
      <GlobalFileViewer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <VaultProvider>
        <WalletProvider>
          <AppContent />
        </WalletProvider>
      </VaultProvider>
    </AuthProvider>
  );
};

export default App;
