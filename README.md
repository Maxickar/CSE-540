# CSE 540 - Group 25 - Project 2

Decentralized Identity and Access Management (IAM) dApp

Maxwell Goisman, Abdullah Alzoabi, Nawaf Alsufiani, Ju-Won Hyun, Farhan Sadaf

## Our idea

We are building a basic system for checking university credentials. A university issues a credential, a student holds it and can share it, and an employer checks if it is real and still valid.

We use smart contracts to keep track of approved universities, student DID hashes, credential hashes, and revocations. We keep the actual credential data off-chain.

## What we have so far

- `contracts/IssuerRegistry.sol` - the admin can approve or remove university accounts.
- `contracts/CredentialRegistry.sol` - registers student DID hashes and handles credential issuance, revocation, and validity checks.
- `contracts/interfaces/` - interfaces for the two contracts.
- `credential-management/` - creates credentials, hashes them, signs them with a university test wallet, saves them locally, and checks signatures.
- `scripts/check-contracts.js` - tests the contracts, permissions, errors, and events.
- `scripts/integrated-demo.js` - reads the sample CSV, registers test students, issues 20 credentials, and tests verification.

## How the demo works

1. The admin approves a university account.
2. Students register DID hashes using their test wallets.
3. The script reads the CSV and creates credentials from the sample data. It generates a new credential ID and timestamp for each one.
4. The university signs each credential, saves it off-chain, and registers its hash on-chain.
5. Verification checks the university's signature, the on-chain hash, issuer approval, and revocation status.
6. The demo also tests changed data, the wrong signer, an invalid signature, and a revoked credential.

The signature check happens in JavaScript. The on-chain `verifyAndLogCredential` function only checks the hash and status, not the signature.

## Tools

- Ethereum-compatible local network through Hardhat
- Solidity (`^0.8.34`) for the smart contracts
- Hardhat and Ethers.js for local testing and wallet interactions
- SHA-256 for hashing credential data

## How to run it

Install Node.js and then run these commands from the repo folder:

```bash
npm ci
npm run compile
npx hardhat run scripts/check-contracts.js
npx hardhat run scripts/integrated-demo.js
```

The integrated demo uses fake students and university accounts. It writes `data/signed-credentials.json` locally when it runs. That file is ignored by Git.

## What is still left

- Build a simple interface for students, universities, and employers.
- Add a way to prove the person sharing a credential controls the student's wallet.
- Improve off-chain storage and the way credentials are shared.
- Do more tests and measure gas costs for the final report.

This is a class prototype. We are not connected to ASU or using real student records.
