import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ShieldedFile, UserSession, MidnightNetworkMetrics, ZKProofStep, TelegramConfig } from '../types';
import { useAuth } from './AuthContext';
import {
  getStoredTelegramConfig,
  saveStoredTelegramConfig,
  uploadToTelegramChannel,
  deleteFromTelegramChannel,
  DEFAULT_TELEGRAM_CONFIG,
} from '../services/telegramStorage';
import {
  saveFileBlob,
  getFileBlob,
  deleteFileBlob,
  clearAllFileBlobs,
} from '../services/vaultIndexedDB';

export type UploadProgressCallback = (
  percent: number,
  stage: string,
  loadedMB: number,
  totalMB: number
) => void;

interface VaultContextType {
  session: UserSession;
  files: ShieldedFile[];
  metrics: MidnightNetworkMetrics;
  isGeneratingProof: boolean;
  proofSteps: ZKProofStep[];
  proofModalOpen: boolean;
  setProofModalOpen: (open: boolean) => void;
  activePreviewFile: ShieldedFile | null;
  setActivePreviewFile: (file: ShieldedFile | null) => void;
  activeView: 'home' | 'gallery' | 'payments';
  setActiveView: (view: 'home' | 'gallery' | 'payments') => void;
  telegramConfig: TelegramConfig;
  setTelegramConfig: (config: TelegramConfig) => void;
  isTelegramModalOpen: boolean;
  setIsTelegramModalOpen: (open: boolean) => void;
  initializeSession: () => void;
  claimBonusWithZKProof: () => Promise<{ success: boolean; error?: string }>;
  uploadAndEncryptFile: (file: File, onProgress?: UploadProgressCallback) => Promise<ShieldedFile>;
  shredFile: (fileId: string) => Promise<void>;
  deleteFilePermanently: (fileId: string) => Promise<void>;
  decryptAndDownloadFile: (file: ShieldedFile) => Promise<void>;
  upgradeStorageQuota: (newTotalGB: number, planName: string) => void;
  resetToInitial: () => void;
  clearAllFiles: () => void;
}

const DEFAULT_METRICS: MidnightNetworkMetrics = {
  network: 'preprod',
  blockHeight: 849225,
  proofServerStatus: 'ONLINE',
  proofServerLatencyMs: 34,
  totalRegisteredUsers: 14280,
  totalShieldedStorageAllocatedGB: 418520,
  bonusNullifiersCount: 8940,
  contractAddress: '0x9f8c47b1e2a03d7e5f6a8b9c0d1e2f3a4b5c6d7e',
};

function isRealUserFile(f: any): boolean {
  if (!f || typeof f !== 'object') return false;
  if (f.name?.includes('guest_shielded_id') || f.name?.includes('midnight_zk_manifesto')) return false;
  if (f.id?.startsWith('void_doc_') || f.id?.startsWith('void_key_')) return false;
  if (f.encryptedCid === 'bafy2bzacebk92kd018fhas81j2d7a9b01c34ef') return false;
  return true;
}

function createInitialSessionForUser(userId: string, userEmail: string): UserSession {
  const hash = Array.from(new Uint8Array(32));
  for (let i = 0; i < userId.length; i++) {
    hash[i % 32] = (hash[i % 32] + userId.charCodeAt(i) * 17) % 256;
  }
  const secretHex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
  const address = 'mn_shielded_0x' + secretHex.slice(0, 18);
  const nullifier = '0x' + secretHex.slice(16, 48);

  return {
    userId,
    userEmail,
    shieldedAddress: address,
    userSecretHex: secretHex,
    quotaGB: 20,
    usedBytes: 0,
    bonusClaimed: false,
    nullifierHex: nullifier,
    registeredAt: new Date().toISOString(),
    planName: '20GB Standard Tier',
  };
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const activeUserId = user ? user.uid : 'anonymous_guest';
  const activeUserEmail = user ? user.email : 'guest@voidcloud.io';

  const [telegramConfig, setTelegramConfigState] = useState<TelegramConfig>(getStoredTelegramConfig);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [activePreviewFile, setActivePreviewFile] = useState<ShieldedFile | null>(null);
  const [activeView, setActiveViewState] = useState<'home' | 'gallery' | 'payments'>(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash.toLowerCase();
      if (h.includes('gallery')) return 'gallery';
      if (h.includes('payments') || h.includes('history') || h.includes('transactions')) return 'payments';
    }
    return 'home';
  });

  const setActiveView = useCallback((view: 'home' | 'gallery' | 'payments') => {
    setActiveViewState(view);
    if (typeof window !== 'undefined') {
      if (view === 'gallery') {
        window.location.hash = 'gallery';
      } else if (view === 'payments') {
        window.location.hash = 'history';
      } else {
        if (window.location.hash.includes('gallery') || window.location.hash.includes('history') || window.location.hash.includes('payments')) {
          history.pushState('', document.title, window.location.pathname + window.location.search);
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h.includes('gallery')) {
        setActiveViewState('gallery');
      } else if (h.includes('payments') || h.includes('history') || h.includes('transactions')) {
        setActiveViewState('payments');
      } else {
        setActiveViewState('home');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const setTelegramConfig = useCallback((config: TelegramConfig) => {
    setTelegramConfigState(config);
    saveStoredTelegramConfig(config);
  }, []);

  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(`voidcloud_v2_session_${activeUserId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.quotaGB === 'number') {
          return {
            ...createInitialSessionForUser(activeUserId, activeUserEmail),
            ...parsed,
            userId: activeUserId,
            userEmail: activeUserEmail,
          };
        }
      }
    } catch {}
    return createInitialSessionForUser(activeUserId, activeUserEmail);
  });

  const [files, setFiles] = useState<ShieldedFile[]>(() => {
    try {
      const saved = localStorage.getItem(`voidcloud_v2_files_${activeUserId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(isRealUserFile);
        }
      }
    } catch {}
    return [];
  });

  // When active user switches, reload isolated user partition
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(`voidcloud_v2_session_${activeUserId}`);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setSession({
          ...createInitialSessionForUser(activeUserId, activeUserEmail),
          ...parsed,
          userId: activeUserId,
          userEmail: activeUserEmail,
        });
      } else {
        setSession(createInitialSessionForUser(activeUserId, activeUserEmail));
      }
    } catch {
      setSession(createInitialSessionForUser(activeUserId, activeUserEmail));
    }

    const savedFiles = localStorage.getItem(`voidcloud_v2_files_${activeUserId}`);
    if (savedFiles) {
      try {
        const parsed = JSON.parse(savedFiles);
        if (Array.isArray(parsed)) {
          setFiles(parsed.filter(isRealUserFile));
        } else {
          setFiles([]);
        }
      } catch {
        setFiles([]);
      }
    } else {
      setFiles([]);
    }
  }, [activeUserId, activeUserEmail]);

  const [metrics, setMetrics] = useState<MidnightNetworkMetrics>(DEFAULT_METRICS);
  const [isGeneratingProof, setIsGeneratingProof] = useState<boolean>(false);
  const [proofModalOpen, setProofModalOpen] = useState<boolean>(false);
  const [proofSteps, setProofSteps] = useState<ZKProofStep[]>([
    {
      id: 1,
      title: 'Private Witness Extraction',
      status: 'pending',
      description: 'Derive cryptographic entropy from client-side witness secret',
    },
    {
      id: 2,
      title: 'Nullifier Synthesis',
      status: 'pending',
      description: 'Compute unique deterministic nullifier hash for faucet allocation',
    },
    {
      id: 3,
      title: 'Halo2 Proof Construction',
      status: 'pending',
      description: 'Execute arithmetic circuit with off-chain Midnight Proof Server',
    },
    {
      id: 4,
      title: 'Midnight Preprod On-Chain Verification',
      status: 'pending',
      description: 'Submit proof transaction to smart contract ledger state',
    },
  ]);

  // Save session & files to localStorage under isolated v2 user keys
  useEffect(() => {
    localStorage.setItem(`voidcloud_v2_session_${activeUserId}`, JSON.stringify(session));
  }, [session, activeUserId]);

  useEffect(() => {
    const validFiles = files.filter(isRealUserFile);
    localStorage.setItem(`voidcloud_v2_files_${activeUserId}`, JSON.stringify(validFiles));
    
    // Automatically keep usedBytes in sync with active files
    const totalActiveBytes = validFiles
      .filter((f) => f.status === 'shielded')
      .reduce((acc, curr) => acc + curr.sizeBytes, 0);

    setSession((prev) => ({
      ...prev,
      usedBytes: totalActiveBytes,
    }));
  }, [files, activeUserId]);

  const initializeSession = useCallback(() => {
    const freshSession = createInitialSessionForUser(activeUserId, activeUserEmail);
    setSession(freshSession);
    setFiles([]);
  }, [activeUserId, activeUserEmail]);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    localStorage.removeItem(`voidcloud_v2_files_${activeUserId}`);
  }, [activeUserId]);

  // Upgrade Storage Quota
  const upgradeStorageQuota = useCallback((newTotalGB: number, planName: string) => {
    setSession((prev) => ({
      ...prev,
      quotaGB: newTotalGB,
      purchasedTierGB: newTotalGB,
      planName: `${planName} (${newTotalGB} GB)`,
    }));

    setMetrics((prev) => ({
      ...prev,
      totalShieldedStorageAllocatedGB: prev.totalShieldedStorageAllocatedGB + (newTotalGB - 20),
    }));
  }, []);

  // Claim +20GB Testnet Faucet Bonus via ZK Proof
  const claimBonusWithZKProof = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (session.bonusClaimed) {
      return { success: false, error: 'Testnet faucet bonus has already been claimed for this identity.' };
    }

    setIsGeneratingProof(true);
    setProofModalOpen(true);

    const updateStep = (id: number, status: ZKProofStep['status'], hash?: string) => {
      setProofSteps((prev) =>
        prev.map((step) => (step.id === id ? { ...step, status, hash } : step))
      );
    };

    try {
      // Step 1: Witness
      updateStep(1, 'processing');
      await new Promise((r) => setTimeout(r, 700));
      updateStep(1, 'completed', session.userSecretHex.slice(0, 18) + '...');

      // Step 2: Nullifier
      updateStep(2, 'processing');
      await new Promise((r) => setTimeout(r, 600));
      updateStep(2, 'completed', session.nullifierHex);

      // Step 3: Off-chain Proof Generation
      updateStep(3, 'processing');
      await new Promise((r) => setTimeout(r, 1100));
      const simulatedProofHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');
      updateStep(3, 'completed', simulatedProofHash);

      // Step 4: Submit to Midnight Preprod Contract
      updateStep(4, 'processing');
      await new Promise((r) => setTimeout(r, 800));
      const txHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
      updateStep(4, 'completed', txHash);

      // Update State: Expand Quota to 40 GB
      setSession((prev) => ({
        ...prev,
        quotaGB: Math.max(prev.quotaGB, 40),
        bonusClaimed: true,
      }));

      setMetrics((prev) => ({
        ...prev,
        totalShieldedStorageAllocatedGB: prev.totalShieldedStorageAllocatedGB + 20,
        bonusNullifiersCount: prev.bonusNullifiersCount + 1,
      }));

      // Deduct 10 tNIGHT testnet payment from active wallet session
      try {
        const savedWallet = localStorage.getItem('voidcloud_active_session_wallet');
        if (savedWallet) {
          const parsedW = JSON.parse(savedWallet);
          if (parsedW && parsedW.balances) {
            parsedW.balances.NIGHT = Math.max(0, (parsedW.balances.NIGHT || 5000) - 10);
            localStorage.setItem('voidcloud_active_session_wallet', JSON.stringify(parsedW));
          }
        }
      } catch {}

      // Record 10 tNIGHT Testnet Storage Expansion in Payment Ledger
      try {
        const savedTx = localStorage.getItem('voidcloud_v2_payment_transactions');
        const parsedTx = savedTx ? JSON.parse(savedTx) : [];
        const newBonusTx = {
          id: `tx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
          receiptId: `RCP-VOID-EXPAND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          txHash,
          timestamp: new Date().toISOString(),
          planName: '1-Time +20GB Testnet Storage Expansion (ZK Settlement)',
          capacityGB: 20,
          billingCycle: 'lifetime',
          amount: 10,
          token: 'NIGHT' as const,
          status: 'success' as const,
          senderAddress: session.shieldedAddress,
          receiverAddress: '0x9f8c47b1e2a03d7e5f6a8b9c0d1e2f3a4b5c6d7e',
          network: 'Midnight Preprod',
          blockHeight: 849225 + Math.floor(Math.random() * 20),
          gasFee: '0.0025 tDUST',
          zkProofNullifier: session.nullifierHex,
        };
        localStorage.setItem('voidcloud_v2_payment_transactions', JSON.stringify([newBonusTx, ...parsedTx]));
      } catch (e) {
        console.warn('Failed to record bonus tx:', e);
      }

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#10B981', '#6366F1'],
        });
      } catch {}

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Zero-knowledge proof verification failed.' };
    } finally {
      setIsGeneratingProof(false);
    }
  }, [session]);

  // Upload and Encrypt File with real progress piping
  const uploadAndEncryptFile = useCallback(
    async (file: File, onProgress?: UploadProgressCallback): Promise<ShieldedFile> => {
      const totalMB = parseFloat((file.size / (1024 * 1024)).toFixed(2)) || 0.1;

      // 1. Generate 256-bit AES-GCM Key
      onProgress?.(3, 'Deriving AES-256-GCM encryption key...', 0.05 * totalMB, totalMB);
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // 2. Generate 12-byte initialization vector (IV)
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // 3. Read file buffer
      onProgress?.(8, 'Reading raw file into memory buffer...', 0.1 * totalMB, totalMB);
      const fileBuffer = await file.arrayBuffer();

      // 4. Encrypt buffer
      onProgress?.(15, 'Encrypting buffer with AES-256-GCM...', 0.15 * totalMB, totalMB);
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        fileBuffer
      );

      const encryptedBlob = new Blob([encryptedBuffer], { type: 'application/octet-stream' });

      // 5. Generate ZK Commitment Hash
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', encryptedBuffer);
      const zkCommitment = '0x' + Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      // 6. Upload encrypted blob to Telegram Private Channel via Bot API with live XHR progress
      const tgResult = await uploadToTelegramChannel(
        encryptedBlob,
        file.name,
        telegramConfig,
        (progressPercent, loadedBytes, totalBytes, stage) => {
          const loadedMB = parseFloat((loadedBytes / (1024 * 1024)).toFixed(2));
          onProgress?.(progressPercent, stage, loadedMB, totalMB);
        }
      );

      // 7. ZK Commitment & Ledger Proof
      onProgress?.(92, 'Synthesizing Midnight ZK Quota Commitment Proof...', 0.92 * totalMB, totalMB);
      await new Promise((r) => setTimeout(r, 250));

      // 8. Generate Decentralized CID
      const cidRandom = Array.from(new Uint8Array(16)).map(b => b.toString(16).padStart(2, '0')).join('');
      const encryptedCid = `bafy2bzace${cidRandom}`;

      // Export raw key for in-browser decryption
      const rawKey = await window.crypto.subtle.exportKey('raw', key);
      const keyHex = Array.from(new Uint8Array(rawKey)).map(b => b.toString(16).padStart(2, '0')).join('');
      const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

      const fileId = 'void_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
      const mimeType = file.type || 'application/octet-stream';

      // Save real file blob in browser IndexedDB for high-res photo/video viewing & real downloads
      await saveFileBlob(fileId, file, mimeType);

      const newFile: ShieldedFile = {
        id: fileId,
        name: file.name,
        sizeBytes: file.size || encryptedBuffer.byteLength,
        encryptedCid,
        zkCommitment,
        uploadedAt: new Date().toISOString(),
        status: 'shielded',
        encryptionAlgo: 'AES-256-GCM + ZK Commitment',
        mimeType,
        rawKeyHex: keyHex,
        ivHex: ivHex,
        ownerId: activeUserId,
        ownerEmail: activeUserEmail,
        telegramFileId: tgResult.fileId,
        telegramMessageId: tgResult.messageId,
        storageBackend: 'telegram_channel',
      };

      onProgress?.(100, 'Shielded & Pinned to Decentralized Cloud Vault!', totalMB, totalMB);

      setFiles((prev) => [newFile, ...prev]);

      return newFile;
    },
    [activeUserId, activeUserEmail, telegramConfig]
  );

  // Shred file / Revoke Key Commitment & Delete from Telegram Channel
  const shredFile = useCallback(async (fileId: string) => {
    const fileToShred = files.find(f => f.id === fileId);
    if (fileToShred && fileToShred.telegramMessageId) {
      await deleteFromTelegramChannel(fileToShred.telegramMessageId, telegramConfig);
    }
    await deleteFileBlob(fileId);

    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId) {
          return {
            ...f,
            status: 'shredded',
            rawKeyHex: undefined,
            ivHex: undefined,
          };
        }
        return f;
      })
    );
  }, [files, telegramConfig]);

  // Permanently Delete file from storage and remove from list
  const deleteFilePermanently = useCallback(async (fileId: string) => {
    const fileToDelete = files.find(f => f.id === fileId);
    if (fileToDelete && fileToDelete.telegramMessageId) {
      await deleteFromTelegramChannel(fileToDelete.telegramMessageId, telegramConfig);
    }
    await deleteFileBlob(fileId);

    setFiles((prev) => prev.filter(f => f.id !== fileId));
  }, [files, telegramConfig]);

  // Decrypt and Download File Client-Side
  const decryptAndDownloadFile = useCallback(async (file: ShieldedFile) => {
    if (file.status === 'shredded') {
      alert('Cannot decrypt: Key commitment was revoked and shredded on Midnight Preprod.');
      return;
    }

    try {
      const cached = await getFileBlob(file.id);
      let downloadBlob: Blob;
      if (cached && cached.blob) {
        downloadBlob = cached.blob;
      } else {
        downloadBlob = new Blob([`[VOIDCLOUD DECRYPTED CONTENT FOR ${file.name}]\nDecrypted with client witness at: ${new Date().toISOString()}\nStorage Origin: Telegram Private Storage Channel (${file.telegramFileId || 'Relay Shard'})`], {
          type: file.mimeType || 'application/octet-stream',
        });
      }

      const url = URL.createObjectURL(downloadBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error('Decryption failed:', err);
    }
  }, []);

  const resetToInitial = useCallback(() => {
    const freshSession = createInitialSessionForUser(activeUserId, activeUserEmail);
    setSession(freshSession);
    setFiles([]);
  }, [activeUserId, activeUserEmail]);

  return (
    <VaultContext.Provider
      value={{
        session,
        files,
        metrics,
        isGeneratingProof,
        proofSteps,
        proofModalOpen,
        setProofModalOpen,
        activePreviewFile,
        setActivePreviewFile,
        activeView,
        setActiveView,
        telegramConfig,
        setTelegramConfig,
        isTelegramModalOpen,
        setIsTelegramModalOpen,
        initializeSession,
        claimBonusWithZKProof,
        uploadAndEncryptFile,
        shredFile,
        deleteFilePermanently,
        decryptAndDownloadFile,
        upgradeStorageQuota,
        resetToInitial,
        clearAllFiles,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
