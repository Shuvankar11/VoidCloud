# Changelog

All notable changes to the **VoidCloud** zero-knowledge decentralized storage vault are documented in this file.

The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and conventional commits.

---

## [1.2.0] - 2026-09-16 (September Challenge Cycle - Level 5 Full Moon)

### 🌟 Highlights
This release delivers the major September 2026 iteration extending the Level 4 MVP based on feedback from 50 verified Midnight Preprod testnet users. It introduces nested folder hierarchies, semantic file tagging, multi-file batch operations, a cryptographic audit trail, and 1-click encrypted vault disaster recovery backups.

### 🚀 Added
- **📁 Directory & Folder Hierarchy**:
  - `src/types/index.ts`: Introduced `VaultFolder` data interface with parent-child hierarchy and color theming.
  - `src/components/BreadcrumbNav.tsx`: Interactive multi-tier breadcrumb navigation component.
  - `src/components/FolderCard.tsx`: Color-coded folder cards (Indigo, Emerald, Rose, Amber, Purple, Sky) with live file counters.
  - `src/components/CreateFolderModal.tsx`: Modal for creating nested subfolders with palette selection.
  - `src/components/MoveToFolderModal.tsx`: Single and bulk file relocation modal with breadcrumb path preview.
- **🏷️ File Classification & Tags**:
  - `src/components/FileTagModal.tsx`: Tag management modal with preset suggestions and custom tag input.
  - Interactive horizontal tag filter pill bar in `StorageVaultDashboard.tsx`.
- **☑️ Multi-File Batch Operations**:
  - `src/components/FloatingBatchBar.tsx`: Floating bottom action bar appearing upon multi-file selection.
  - Bulk actions: Star, Unstar, Move to Trash, Move to Folder, Decrypt & Download, and Select All.
- **📜 Cryptographic Audit Trail**:
  - `src/services/auditLogger.ts`: Tamper-resistant telemetry logging service generating SHA-256 event integrity hashes.
  - `src/components/ZKAuditLogModal.tsx`: UI modal for searching, filtering by severity (`info`, `success`, `warning`), and exporting logs to JSON.
- **💾 Vault Backup & Disaster Recovery**:
  - `src/services/vaultBackup.ts`: Snapshot serialization and SHA-256 integrity checksum generator.
  - `src/components/VaultBackupModal.tsx`: 1-click JSON backup export and snapshot restore engine.
- **📜 Compact Smart Contract Upgrade (Release v1.2.0)**:
  - `contracts/voidcloud.compact`: Upgraded smart contract to align with Level 5 (September 2026 iteration) feature set.
  - Added 4 on-chain public ledger states: `totalFoldersCreated`, `totalBatchOperationsCommitted`, `auditTrailMerkleRoots`, `vaultBackupCheckpoints`.
  - Added 2 private witnesses: `folderSecret()`, `auditMerkleWitness()`.
  - Implemented 5 new exported circuits: `createFolderCommitment`, `commitBatchFileActions`, `anchorAuditTrailRoot`, `verifyVaultBackupCommitment`, `upgradeStorageQuota`.
  - Live deployed & verified Midnight Preprod Contract address: `0x89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0` (Block `#2589085`).
  - Recompiled Compact TypeScript bindings (`npm run compact:compile`) and updated deployment manifesto (`deployed-contract.json`).
- **🧪 Comprehensive Test Coverage (34 Tests Total)**:
  - `tests/folders.test.ts`: 4 unit tests verifying folder creation, nesting, relocation, and cascading deletion.
  - `tests/audit.test.ts`: 4 unit tests verifying audit logging, storage persistence, and size limiting.
  - `tests/backup.test.ts`: 5 unit tests verifying checksum generation, archive parsing, and corrupted JSON rejection.
  - `tests/batch.test.ts`: 4 unit tests verifying bulk star, bulk trash, bulk restore, and file tagging.
  - `tests/wallet.test.ts`: 4 unit tests verifying 1AM Wallet & Midnight Lace multi-token derivation and disconnects.
  - `tests/voidcloud.test.ts`: 13 unit tests verifying ledger capacity, nullifier collision prevention, and storage quota proofs.

### 🔄 Changed
- `src/context/VaultContext.tsx`: Integrated folder hierarchy state, folder CRUD, tag updates, batch operations, audit log hooks, backup import/export, and contract address binding.
- `src/components/StorageVaultDashboard.tsx`: Redesigned toolbar with "+ Folder", "Audit Log", and "Backup" CTAs, table row checkboxes, tag chips, and dropdown actions.
- `README.md`: Documented the Level 5 Full Moon checklist, September feature extensions, updated test matrix (34 passing tests), and contract v1.2.0 upgrade.
- `docs/USER_FEEDBACK_REPORT.md`: Synchronized user feedback requests with delivered September iteration features.
- `docs/PREPROD_USERS.md`: Updated contract address reference and live Midnight Preprod Explorer links.

---

## [1.1.0] - 2026-08-20 (August Challenge Cycle - Level 4 Waxing Gibbous)

### 🚀 Added
- Deployed Midnight Preprod Smart Contract (`0x89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0`, Block `#2589085`).
- Lace Dual-Chain CIP-30 Wallet integration with balance tracking.
- Client-side AES-256-GCM envelope encryption engine.
- Off-chain Halo2 ZK proof synthesis for storage entitlement and bonus nullifiers.
- On-chain payment ledger and verifiable transaction history (`/#history`).
- Automated CI/CD GitHub Actions pipeline (`.github/workflows/ci.yml`).
- Standalone Node.js CLI tool (`cli/void.js`).
- Automated Vitest test suite (`tests/voidcloud.test.ts`, 13 tests).

---

## [1.0.0] - 2026-08-10 (Level 1 & Level 2 Genesis)

### 🚀 Added
- Compact smart contract written in `contracts/voidcloud.compact`.
- Initial repository scaffolding, Vite/React TypeScript architecture, and Tailwind CSS styling.
