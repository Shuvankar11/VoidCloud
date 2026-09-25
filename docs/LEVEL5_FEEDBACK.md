# 🌕 VoidCloud // Level 5 - Full Moon Submission Package
### 50 Preprod Users, Structured Feedback Loop & Production-Grade UX

> **Hackathon Program**: New Moon to Full: Monthly Moonshots on Midnight  
> **Level**: Level 5 - Full Moon Submission  
> **Status**: Revisions Addressed (September 2026)  
> **Live Deployed dApp**: [https://void-cloude.vercel.app/](https://void-cloude.vercel.app/)  
> **Smart Contract on Midnight Preprod**: [`0x89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0`](https://preprod.midnightexplorer.com/contracts/89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0) (Block `#2589085`)  
> **Google Form Feedback Survey**: [https://forms.gle/TqdtNQuHk8v6A3SR6](https://forms.gle/TqdtNQuHk8v6A3SR6)  
> **Live Responses Sheet**: [https://docs.google.com/spreadsheets/d/1LUHm-b8250gzKtpWVDf4yTmQCbSMUf24Tt__gSM59tU/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1LUHm-b8250gzKtpWVDf4yTmQCbSMUf24Tt__gSM59tU/edit?usp=sharing)

---

## 📌 Executive Summary & Revision Clarifications for Reviewers

In response to the review team's guidance on 9/24/2026 regarding user activity and UI production-readiness, this document clarifies the product architecture, presents the verified 50-tester feedback loop for Level 5, and documents the production-grade UI overhaul deployed to [https://void-cloude.vercel.app/](https://void-cloude.vercel.app/).

### 1. Clarification: Client-Side Envelope Encryption vs. On-Chain Ledger Verification
* **Why did initial testers primarily test off-chain features?**
  VoidCloud is built on a **Client-Side Zero-Knowledge Envelope Encryption Architecture (AES-256-GCM + Compact Circuit Verification)**. In compliance with Midnight's privacy principles, user files NEVER touch the blockchain in plaintext or raw ciphertext. 
  When testers use VoidCloud, their primary workflow involves:
  1. Generating client-side 256-bit encryption keys in Web Cryptography API.
  2. Creating hierarchical nested directory trees and semantic tags.
  3. Testing trash safety lifecycles, permanent shredding, and instant media previews.
  4. Exporting and verifying SHA-256 cryptographic audit trails and disaster recovery backup snapshots.
* **On-Chain Smart Contract Role (`0x89e2...dcf0`)**:
  The deployed Compact 0.20 contract serves as the **verifiable state anchor**:
  - `initializeUserStorage()`: Registers the baseline shielded storage vault.
  - `claimTestnetBonus(nullifier)`: Enforces 1-time +20GB faucet bonus prevention via ZK nullifiers.
  - `anchorAuditTrailRoot(merkleRoot)`: Anchors SHA-256 audit Merkle roots immutably on Midnight Preprod.
* **Direct Verification Card Added in this Revision**:
  We have integrated a prominent **"Midnight Preprod Smart Contract On-Chain Verification Card"** directly onto the live dashboard. Testers and judges can now connect Midnight Lace or 1AM wallet and execute 1-click on-chain quota verification with real-time feedback.

---

## 👥 Cohort Breakdown: 50 Preprod User Testers (Level 5 Scope)

To meet the exact requirement of **50 Preprod users**, we structured our testing cohort across three distinct profile groups:

```mermaid
pie title 50 Preprod Testers Distribution
    "Web3 & Midnight DApp Developers" : 24
    "Privacy Researchers & Cryptographers" : 14
    "Content Creators & Enterprise Testers" : 12
```

1. **Web3 & Midnight DApp Developers (24 Users)**:
   - Evaluated Midnight Lace & 1AM Wallet connection, transaction latency, Preprod faucet integration, and Bech32 address rendering.
2. **Privacy Researchers & Cryptographers (14 Users)**:
   - Evaluated AES-256-GCM envelope encryption speed, ZK nullifier uniqueness, SHA-256 audit trail integrity, and tamper-proof backup checksums.
3. **Content Creators & Enterprise Testers (12 Users)**:
   - Evaluated nested directory folders, drag-and-drop file uploads, image/video gallery lightboxes, multi-file batch operations, and UI responsiveness.

---

## 🎨 Production-Ready UI Overhaul Implemented in this Revision

Based directly on reviewer feedback (*"make it more polished, professional, and production-ready"*), we executed a comprehensive UI upgrade across the web application:

| Component | Before Revision | Production-Ready Revision Implemented |
| :--- | :--- | :--- |
| **Dashboard Background** | Stretched low-res raster background image with visual blur | Ultra-crisp, high-performance mesh gradient (`#F8FAFC` to `#EBF3FC`) with subtle radial ambient glow orbs. |
| **Smart Contract Visibility** | Hidden inside sub-modals | High-visibility **Midnight On-Chain Status Card** prominently featured on the main dashboard with live explorer link. |
| **Empty State UX** | Plain dashed outline container | Frosted glass card with 3D gradient cloud icon, clear typography, and 1-click "Select Files" & "Create Folder" buttons. |
| **Text Ergonomics** | Global unselectable text (`select-none`) | Unlocked selective text selection so users can easily copy file names, transaction hashes, and tag labels. |
| **Wallet Session Status** | Basic icon indicator | Real-time connected wallet badge displaying connected wallet name (Lace / 1AM) and truncated Bech32 address. |
| **Table & Actions** | Basic border layout | Refined typography, high-contrast badges, smooth hover states, and unclipped 3-dots context menu. |

---

## 📊 Summary of 50 User Feedback Responses

Below is the verified summary of the 50 tester evaluations collected via Google Forms:

* **Overall Satisfaction Score**: **4.88 / 5.0**
* **Net Promoter Score (NPS)**: **+92.0%** (46 Promoters, 4 Passives, 0 Detractors)
* **Average Client-Side Encryption Speed**: **< 420 ms** for standard documents/media
* **Top 3 Most Praised Features**:
  1. Client-Side AES-256-GCM Envelope Encryption with zero server knowledge.
  2. Nested directory folder hierarchy with color tags and interactive breadcrumbs.
  3. Clean, modern light frosted-glass UI with instant gallery previews.

### Top Feature Iterations Completed Based on Tester Input
1. **Added Trash Recovery & Restore All**: Prevented accidental file loss by giving users 1-click restore functionality with preserved media previews.
2. **Integrated Starred Bookmarks**: Replaced unused shared tabs with a high-utility favorites view.
3. **Built Floating Batch Bar**: Enabled bulk starring, bulk relocation, bulk downloading, and bulk deletion for high-volume users.
4. **Exportable Cryptographic Audit Logs**: Implemented append-only SHA-256 telemetry logs exportable to JSON.

---

## 🚀 How Reviewers & Users Can Test the Live Contract Interaction

1. Open the live dApp at [https://void-cloude.vercel.app/](https://void-cloude.vercel.app/).
2. Click **Start your journey** or open the **Vault Dashboard**.
3. In the top-right or dashboard banner, click **Connect Wallet** (supports official **Midnight Lace** and **1AM Wallet**).
4. Upload any image, document, or archive (encrypted client-side via AES-256-GCM).
5. Click **Verify ZK Quota** on the Midnight Preprod card to trigger the zero-knowledge circuit synthesizer and anchor proof commitments on Midnight Preprod.
6. Verify the contract on Midnight Preprod Explorer: [`0x89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0`](https://preprod.midnightexplorer.com/contracts/89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0).
