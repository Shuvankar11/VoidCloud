export interface ShieldedFile {
  id: string;
  name: string;
  sizeBytes: number;
  encryptedCid: string;
  zkCommitment: string;
  uploadedAt: string;
  status: 'shielded' | 'shredded';
  encryptionAlgo: string;
  mimeType?: string;
  ownerId?: string;
  ownerEmail?: string;
  isStarred?: boolean;
  previewDataUrl?: string;
  rawBlob?: Blob;
  decryptedBlobUrl?: string;
  rawKeyHex?: string;
  ivHex?: string;
  telegramFileId?: string;
  telegramMessageId?: number;
  storageBackend?: 'telegram_channel' | 'local_vault' | 'midnight_ipfs';
  folderId?: string | null;
  tags?: string[];
}

export interface VaultFolder {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  color?: string;
  description?: string;
}

export type AuditActionType =
  | 'FILE_ENCRYPT_UPLOAD'
  | 'FILE_DECRYPT_DOWNLOAD'
  | 'FILE_STAR_TOGGLED'
  | 'FILE_MOVE_FOLDER'
  | 'FILE_TAGS_UPDATED'
  | 'FILE_TRASHED'
  | 'FILE_RESTORED'
  | 'FILE_PERMANENTLY_DELETED'
  | 'FOLDER_CREATED'
  | 'FOLDER_DELETED'
  | 'ZK_PROOF_GENERATED'
  | 'ZK_FAUCET_CLAIMED'
  | 'VAULT_BACKUP_EXPORTED'
  | 'VAULT_BACKUP_RESTORED';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: AuditActionType;
  details: string;
  targetName?: string;
  proofHash?: string;
  txHash?: string;
  severity: 'info' | 'success' | 'warning' | 'security';
}

export interface VaultBackupArchive {
  version: string;
  exportedAt: string;
  shieldedAddress: string;
  totalFiles: number;
  totalFolders: number;
  files: Omit<ShieldedFile, 'rawBlob'>[];
  folders: VaultFolder[];
  auditLogs?: AuditLogItem[];
  checksum: string;
}

export interface UserSession {
  userId?: string;
  userEmail?: string;
  shieldedAddress: string;
  userSecretHex: string;
  quotaGB: number;
  usedBytes: number;
  bonusClaimed: boolean;
  nullifierHex: string;
  registeredAt: string;
  purchasedTierGB?: number;
  planName?: string;
}

export interface MidnightNetworkMetrics {
  network: 'preprod' | 'preview' | 'testnet';
  blockHeight: number;
  proofServerStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  proofServerLatencyMs: number;
  totalRegisteredUsers: number;
  totalShieldedStorageAllocatedGB: number;
  bonusNullifiersCount: number;
  contractAddress: string;
}

export interface ZKProofStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  hash?: string;
}

export interface TerminalOutputItem {
  id?: string;
  timestamp?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'dim' | 'banner' | 'ascii' | 'input' | 'output';
  text: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletName: 'Midnight Lace' | '1AM Wallet' | 'MetaMask' | 'Coinbase' | 'Phantom' | null;
  network: 'Midnight Preprod' | 'Midnight Preview' | 'Ethereum' | 'Cardano';
  balances: {
    NIGHT: number;
    tDUST: number;
    ADA: number;
    USDT: number;
    ETH: number;
  };
}

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

export interface PlanPricing {
  USD: number;
  NIGHT: number;
  tDUST: number;
  ADA: number;
  USDT: number;
  ETH: number;
}

export interface StoragePlan {
  id: 'plan_20gb' | 'plan_80gb' | 'plan_50gb' | 'plan_100gb' | 'plan_500gb';
  name: string;
  capacityGB: number;
  badge?: string;
  description: string;
  pricing: {
    monthly: PlanPricing;
    yearly: PlanPricing;
    lifetime: PlanPricing;
  };
  features: string[];
}

export type TransactionStatus = 'success' | 'failed' | 'pending';

export type TransactionType =
  | 'storage_upgrade'
  | 'storage_renewal'
  | 'faucet_claim'
  | 'zk_bonus_claim'
  | 'bandwidth_topup';

export interface PaymentTransaction {
  id: string;
  txHash: string;
  timestamp: string;
  planId?: string;
  planName: string;
  capacityGB?: number;
  billingCycle?: BillingCycle | 'one_time' | 'free_bonus' | 'faucet';
  amount: number;
  token: 'NIGHT' | 'tDUST' | 'ADA' | 'USDT' | 'ETH' | 'FREE';
  status: TransactionStatus;
  failureReason?: string;
  senderAddress: string;
  receiverAddress: string;
  network: string;
  blockHeight?: number;
  gasFee?: string;
  zkProofNullifier?: string;
  receiptId: string;
  userId?: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  channelName: string;
  isConnected: boolean;
  isCustom: boolean;
}
