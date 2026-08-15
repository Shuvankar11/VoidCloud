/**
 * VoidCloud Protocol Treasury & Receiving Wallet Configuration
 * All multi-token payments (NIGHT, tDUST, ADA, USDT, ETH) from storage tier upgrades
 * are routed directly to this verified recipient address.
 */

export const TREASURY_CONFIG = {
  // Primary Cardano & Midnight Network Receiving Wallet (Lace Wallet)
  midnightTreasuryAddress:
    import.meta.env.VITE_TREASURY_MIDNIGHT_ADDRESS ||
    'addr_test1qp6ja6agem4yj7c2784kphsdej00764yvmnn8mn6ztl5z7ln6nxvtdy3hgfenkd028rldupm5x5t4czpwyglnn6lx4xse2kggj',

  // Cardano Testnet Address
  cardanoTreasuryAddress:
    import.meta.env.VITE_TREASURY_CARDANO_ADDRESS ||
    'addr_test1qp6ja6agem4yj7c2784kphsdej00764yvmnn8mn6ztl5z7ln6nxvtdy3hgfenkd028rldupm5x5t4czpwyglnn6lx4xse2kggj',

  // EVM Fallback Receiver
  evmTreasuryAddress:
    import.meta.env.VITE_TREASURY_EVM_ADDRESS ||
    '0x9f8c47b1e2a03d7e5f6a8b9c0d1e2f3a4b5c6d7e',

  // Protocol Identity
  merchantName: 'VoidCloud Decentralized Storage Protocol',
  treasuryOwner: 'Shuvankar Samanta',
};
