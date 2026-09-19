# 🧪 VoidCloud Automated Testing Strategy

## Overview
VoidCloud uses [Vitest](https://vitest.dev/) for unit and integration testing of cryptographic operations, smart contract circuits, wallet state management, directory hierarchies, and disaster recovery backup engines.

## Test Suites (34 Passing Tests)
| Suite File | Scope / Focus | Test Count |
| :--- | :--- | :---: |
| `tests/voidcloud.test.ts` | Compact 0.20 contract circuits & ZK nullifier validation | 13 |
| `tests/wallet.test.ts` | CIP-30 / 1AM / Midnight Lace connection and balance sync | 4 |
| `tests/folders.test.ts` | Recursive directory tree creation, hierarchy, cascading delete | 4 |
| `tests/batch.test.ts` | Floating batch operations (bulk star, bulk trash, bulk tag) | 4 |
| `tests/audit.test.ts` | Cryptographic SHA-256 audit trail and tamper resilience | 4 |
| `tests/backup.test.ts` | Encrypted snapshot serialization, SHA-256 verification, restore | 5 |

## Execution Commands
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```
