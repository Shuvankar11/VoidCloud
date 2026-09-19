# 🚀 VoidCloud Deployment & Node Configuration Guide

## Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Midnight Preprod network credentials and testnet tokens (NIGHT/tDUST)

## 1. Running Midnight Proof Server
The proof server evaluates Halo2 arithmetic circuits locally to generate zero-knowledge proofs.

```bash
# Pull official Midnight Proof Server container
docker pull midnightnetwork/proof-server:latest

# Launch proof server on port 6300
docker run -d -p 6300:6300 --name midnight-prover midnightnetwork/proof-server:latest
```

## 2. Environment Variables (.env)
```env
VITE_MIDNIGHT_NETWORK=preprod
VITE_MIDNIGHT_PROOF_SERVER_URL=http://localhost:6300
VITE_CONTRACT_ADDRESS=0x89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0
VITE_DEPLOYMENT_BLOCK=2589085
```

## 3. Production Build & Deployment
```bash
npm install
npm run build
```
Deploy the `dist/` directory to Vercel, Netlify, or any IPFS gateway.
