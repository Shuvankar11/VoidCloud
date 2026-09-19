# 🕵️ VoidCloud Zero-Knowledge Privacy Specification

## Abstract
This document formalizes the privacy leakage bounds and observer model for VoidCloud on the Midnight Network Preprod testnet.

## 1. Threat Model & Observer Capabilities
An observer is defined as any external passive or active entity with complete read access to:
- Midnight blockchain state and transaction histories (`preprod.midnightexplorer.com`).
- Public decentralized relay traffic and shard exchange channels.
- Front-end HTTP server requests and static assets.

## 2. Leakage Analysis
### What is Leaked (Public by Design)
1. **Contract Address**: The deployed Compact contract (`0x89e2...dcf0`).
2. **Transaction Timestamps & Gas**: When a transaction is submitted to Midnight Preprod.
3. **Aggregated Storage Counter**: The contract's global allocated capacity (`totalStorageAllocated`).
4. **Blinded Nullifiers**: Hashes inserted into the nullifier set to prevent double claims.

### What is Kept Zero-Knowledge (Hidden by Invariant)
1. **Plaintext Files**: Raw content, file names, directory structures, and file sizes.
2. **Encryption Keys**: AES-256 symmetric keys and IVs derived client-side.
3. **User Identity Linkage**: Linkage between unshielded wallets and private vault states.
4. **Folder Hierarchy**: Directory path structures and tags.
