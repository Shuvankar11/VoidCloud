/**
 * VoidCloud Protocol Treasury & Receiving Wallet Configuration
 * All multi-token payments (NIGHT, tDUST, ADA, USDT, ETH) from storage tier upgrades
 * are routed directly to this recipient address.
 */

export const TREASURY_CONFIG = {
  // Midnight / Cardano Receiving Address
  midnightTreasuryAddress:
    import.meta.env.VITE_TREASURY_MIDNIGHT_ADDRESS ||
    'mn_preprod1q805b452809e36e9536af7155b08ebc48f2ee2aea6f3166d3',

  // EVM (USDT / ETH) Receiving Address
  evmTreasuryAddress:
    import.meta.env.VITE_TREASURY_EVM_ADDRESS ||
    '0x9f8c47b1e2a03d7e5f6a8b9c0d1e2f3a4b5c6d7e',

  // Merchant Name
  merchantName: 'VoidCloud Decentralized Storage Protocol',
};
