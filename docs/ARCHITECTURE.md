# 🏗️ VoidCloud System Architecture Specification

## 1. System Overview
VoidCloud is an enterprise-grade, privacy-preserving decentralized cloud storage platform built on the Midnight Network Preprod testnet. It fuses client-side AES-256-GCM envelope encryption with Midnight Compact 0.20 zero-knowledge smart contracts and Halo2 ZK-SNARK proving circuits.

```mermaid
graph TD
    subgraph Client["Client Browser (Private Enclave)"]
        UI["React 18 + Tailwind UI"]
        Wallet["WalletContext (Midnight Lace / 1AM)"]
        Vault["VaultContext (Client Storage Engine)"]
        Crypto["Crypto Subsystem (Web Crypto API / AES-GCM)"]
        Audit["Cryptographic Audit Logger (SHA-256)"]
    end

    subgraph Prover["Midnight Proving Pipeline"]
        ProverSrv["Midnight Proof Server (Port 6300)"]
        Witness["Private Witness Synthesizer"]
        Halo2["Halo2 ZK Circuit Engine"]
    end

    subgraph Network["Midnight Network Preprod"]
        Contract["Compact 0.20 Smart Contract (0x89e2...dcf0)"]
        State["On-Chain Storage Quota Ledger"]
        Nullifiers["Blinded Nullifier Set"]
    end

    subgraph Relays["Decentralized Storage Layer"]
        Chunker["Cryptographic Shard Generator"]
        Shards["Encrypted Blob Relays (Telegram MTProto)"]
    end

    UI --> Wallet
    UI --> Vault
    Vault --> Crypto
    Vault --> Audit
    Vault --> Witness
    Witness --> ProverSrv
    ProverSrv --> Halo2
    Halo2 --> Contract
    Contract --> State
    Contract --> Nullifiers
    Vault --> Chunker
    Chunker --> Shards
```

## 2. Multi-Tier Privacy Architecture
1. **Client Secure Enclave**: All encryption keys and private secrets (`userSecret`) remain exclusively in client volatile memory. Neither plaintext files nor encryption keys ever cross the network boundary.
2. **Off-Chain Proof Synthesis**: The client compiles private inputs into arithmetic constraints verified by the local proof server.
3. **On-Chain Settlement**: The Compact smart contract validates proof satisfaction and commits state transitions without learning sensitive payload data.
4. **Decentralized Chunk Storage**: Files are split into encrypted shards distributed across decentralized storage relays.
