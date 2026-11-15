# CSE 540 - Group 25 - Project 2

Decentralized Identity and Access Management (IAM) dApp

Maxwell Goisman, Abdullah Alzoabi, Nawaf Alsufiani, Ju-Won Hyun, Farhan Sadaf

## Our project

We are building a simple system for verifying university credentials. Universities sign and issue credentials, and verifiers check the issuer’s signature, data integrity, and current validity.

The goal is for students to share their credentials with employers. The student sharing flow and user interface are still planned.

We use smart contracts to track approved universities and credential records. Original credentials and signatures stay off-chain in a local JSON file. The contracts store hashes, wallet addresses, and credential status.

## Main files

- `contracts/IssuerRegistry.sol` - approves universities and removes their approval.
- `contracts/CredentialRegistry.sol` - registers student DID hashes and handles issuing, revoking, and checking credentials.
- `contracts/interfaces/` - defines the interfaces for both contracts.
- `credential-management/credential.js` - creates and hashes credentials.
- `credential-management/signature.js` - signs credentials and recovers the signer’s address.
- `credential-management/signed-storage.js` - saves and retrieves original credentials and signatures.
- `credential-management/verification.js` - checks the signature against the recorded issuer, then checks contract validity.
- `data/demo-credentials.csv` - contains 20 sample credentials for 5 students.
- `scripts/check-contracts.js` - checks contract permissions, invalid inputs, duplicates, revocation, and events.
- `scripts/integrated-demo.js` - connects the modules and runs the complete demo.

## How the demo works

1. The admin approves university wallets.
2. Students register their DID hashes using test wallets.
3. The script reads the CSV and creates credentials with new UUIDs and timestamps.
4. The university signs each credential, and the original data and signature are saved together.
5. The university registers each credential’s hash through the smart contract.
6. The verifier checks the signature and the contract record.
7. The demo checks modified data, a different signer, an invalid signature, and a revoked credential.

**Issuance:**

CSV → Create credential → University signs → Save original and signature → Register hash on-chain

**Verification:**

Read original and signature → Recover signer → Match the recorded issuer → Check hash, issuer approval, and revocation status

Signature verification happens in JavaScript. Contract checks happen through `isCredentialValid()`. Both must pass for the credential to be accepted.

## Demo results

The demo issues and verifies 20 credentials for 5 students, then checks four invalid cases.

| Scenario | Valid |
| --- | --- |
| Original credential | true |
| Changed degree | false |
| Wrong signer | false |
| Invalid signature | false |
| Revoked credential | false |

The wrong-signer case uses another approved university. Its signature is rejected because it does not match the university that issued that credential.

## Tools

Solidity, Hardhat, Ethers.js, Node.js, and SHA-256.

Everything currently runs on a local Hardhat network using test wallets.

## How to run it

Use Node.js 22.13 or newer. From the project folder, run:

```bash
npm ci
npm run compile
npx hardhat run scripts/check-contracts.js
npx hardhat run scripts/integrated-demo.js
```

The integrated demo saves original credentials and signatures to `data/signed-credentials.json`. Git ignores this generated file.

Each run deploys fresh local contracts and appends new credentials to the JSON file. Records from earlier runs belong to those earlier deployments.

## What we still need to do

- Make an interface for students, universities, and employers.
- Add proof that a student presenting a credential owns its associated wallet.
- Improve credential storage and student sharing.
- Extend testing and measure gas costs for the final report.

This is a class project using dummy data, with no connection to ASU systems. It checks signatures and recorded credential status; it does not determine whether an approved university’s original academic claims are truthful.
