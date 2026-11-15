# CSE 540 - Group 25 - Project 2

Decentralized Identity and Access Management (IAM) dApp

Maxwell Goisman, Abdullah Alzoabi, Nawaf Alsufiani, Ju-Won Hyun, Farhan Sadaf

## Our project

We are building a simple system for verifying university credentials. A university issues a credential to a student, and the student can share it with an employer. The employer can check if the credential is real and still valid.

We use smart contracts to keep track of approved universities and credential records. The actual student information is kept off-chain.

## Main files

- contracts/IssuerRegistry.sol - the admin can approve universities or remove their approval.
- contracts/CredentialRegistry.sol - registers student DID hashes and handles issuing, revoking, and checking credentials.
- contracts/interfaces/ - lists the functions for both contracts.
- credential-management/ - creates, hashes, signs, and saves credentials. It also checks signatures.
- scripts/check-contracts.js - tests the contracts and checks permissions and errors.
- scripts/integrated-demo.js - uses sample data to issue and verify 20 credentials and test invalid ones.

## How the demo works

1. The admin approves a university.
2. Students register their DID hashes.
3. The university signs the credentials, and their hashes are recorded on the blockchain.
4. The script checks the university signature, stored hash, and whether the credential is still valid.
5. We also test changed data, wrong signatures, and revoked credentials to make sure they fail.

The signature check is done in JavaScript. The contracts handle the credential hashes, issuer approval, and revocation status.

## Tools

We are using Solidity, Hardhat, Ethers.js, Node.js, and SHA-256. For now, everything runs locally using Hardhat.

## How to run it

Install Node.js, open a terminal in the project folder, and run:

```bash
npm ci
npm run compile
npx hardhat run scripts/check-contracts.js
npx hardhat run scripts/integrated-demo.js
```

The demo uses fake students and universities. It saves a JSON file at data/signed-credentials.json when it runs. Git ignores that file.

## What we still need to do

- Make a simple interface for students, universities, and employers.
- Add a way for students to prove they own the wallet connected to their credential.
- Improve how credentials are stored and shared.
- Do more testing and measure gas costs for the final report.

This is just a class project, so we are not using real student records or connecting to ASU systems.
