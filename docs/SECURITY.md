# 🛡️ VoidCloud Security & Cryptographic Invariants Policy

## 1. Cryptographic Guarantees
- **AES-256-GCM Envelope Encryption**: Every stored asset is encrypted client-side using a cryptographically random 256-bit symmetric key and a unique 96-bit initialization vector (IV).
- **Zero-Knowledge Witness Secrecy**: The user's secret entropy (`userSecret: Bytes<32>`) is never transmitted over HTTP, RPC, or blockchain transactions.
- **Double-Claim Protection**: Faucet bonus claims enforce cryptographic nullifiers stored in the smart contract's state set. Attempting duplicate bonus redemption results in transaction revert.
- **Audit Log Tamper-Resistance**: Each audit trail event is cryptographically linked with SHA-256 hash chains.

## 2. Threat Model Boundaries
| Asset | In-Transit Protection | At-Rest Protection | Observer Visibility |
| :--- | :--- | :--- | :--- |
| File Payload | TLS 1.3 + Encrypted Blobs | AES-256-GCM Shards | Ciphertext only |
| User Identity | Shielded Proof | Client Memory | Pseudonymous Wallet |
| Quota Commitments | Zero-Knowledge Proof | Compact Contract Ledger | Validated Proof Flag |

## 3. Vulnerability Reporting
If you discover a security vulnerability within VoidCloud, please report it responsibly by contacting the maintainers at security@voidcloud.io or filing an encrypted GitHub security advisory.
