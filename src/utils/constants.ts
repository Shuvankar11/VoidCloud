/**
 * VoidCloud Global Constants & Network Configurations
 */

export const MIDNIGHT_NETWORK_CONFIG = {
  NETWORK_ID: 'preprod',
  NETWORK_NAME: 'Midnight Preprod Testnet',
  CONTRACT_ADDRESS: '0x89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0',
  DEPLOYMENT_BLOCK: 2589085,
  DEPLOYMENT_TX: '0x2758f932e69ecc334a7baefbb356f7355afbc079673b8e206511f6c8bd5f42e7',
  EXPLORER_BASE_URL: 'https://preprod.midnightexplorer.com',
  PROOF_SERVER_URL: 'http://127.0.0.1:6300',
  DEFAULT_QUOTA_GB: 20,
  BONUS_QUOTA_GB: 20,
  TOTAL_BASE_STORAGE_BYTES: 40 * 1024 * 1024 * 1024 // 40 GB
} as const;

export const STORAGE_TIERS = [
  { id: 'standard', name: 'Standard Shielded', sizeGB: 40, price: 'FREE (Testnet)', recommended: true },
  { id: 'pro', name: 'Developer Pro', sizeGB: 100, price: '500 tNIGHT', recommended: false },
  { id: 'enterprise', name: 'Enterprise ZK Vault', sizeGB: 500, price: '2,000 tNIGHT', recommended: false }
] as const;

export const APP_METADATA = {
  NAME: 'VoidCloud',
  TAGLINE: 'Zero-Knowledge Privacy-First Decentralized Cloud Storage',
  VERSION: '1.3.0',
  GITHUB_URL: 'https://github.com/Shuvankar11/VoidCloud',
  LIVE_DAPP_URL: 'https://void-cloude.vercel.app'
} as const;
