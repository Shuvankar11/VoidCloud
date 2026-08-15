/**
 * VoidCloud Protocol Treasury & Receiving Wallet Configuration
 * All multi-token payments (NIGHT, tDUST, ADA, USDT, ETH) and ZK storage transactions
 * are routed directly to Shuvankar Samanta's verified Midnight & Cardano wallet suite.
 */

export const TREASURY_CONFIG = {
  // Protocol Identity & Owner
  treasuryOwner: 'Shuvankar Samanta',
  merchantName: 'VoidCloud Decentralized Storage Protocol',

  // 1. Midnight Network Shielded Address (ZK-SNARK & Private Storage Shard Transfers)
  midnightShieldedAddress:
    import.meta.env.VITE_TREASURY_MIDNIGHT_SHIELDED_ADDRESS ||
    'mn_shield-addr_preprod14zyfy6nr6dylgsffdcknugp7mrxmgrptymt8a7vh4vj4w4yetsdvh7eg58w535z2qr59cu45wn6w0k2tjvud60vm62wa5ltax3lkjpc7587tn',

  // 2. Midnight Network Unshielded Address (NIGHT Token Transfers & Public Ledger)
  midnightUnshieldedAddress:
    import.meta.env.VITE_TREASURY_MIDNIGHT_UNSHIELDED_ADDRESS ||
    'mn_addr_preprod15gfl98ha5jg2l99awxjww4pzyymnfjljf68nvd74s0r0q2nwy70srzssjm',

  // 3. Midnight DUST Address (tDUST Storage Subsidies & Shielding Gas)
  midnightDustAddress:
    import.meta.env.VITE_TREASURY_MIDNIGHT_DUST_ADDRESS ||
    'mn_dust_preprod1dl65fhwwr0hhfm36vj3v4m2z5gfwjpkpnlmsx2rxjphaqhds49zs2u5clq',

  // 4. Cardano Network Address (ADA Payments & Lace Connector)
  cardanoTreasuryAddress:
    import.meta.env.VITE_TREASURY_CARDANO_ADDRESS ||
    'addr_test1qp6ja6agem4yj7c2784kphsdej00764yvmnn8mn6ztl5z7ln6nxvtdy3hgfenkd028rldupm5x5t4czpwyglnn6lx4xse2kggj',

  // 5. EVM Fallback Receiver
  evmTreasuryAddress:
    import.meta.env.VITE_TREASURY_EVM_ADDRESS ||
    '0x9f8c47b1e2a03d7e5f6a8b9c0d1e2f3a4b5c6d7e',

  // Convenience Aliases
  midnightTreasuryAddress:
    'mn_addr_preprod15gfl98ha5jg2l99awxjww4pzyymnfjljf68nvd74s0r0q2nwy70srzssjm',
};
