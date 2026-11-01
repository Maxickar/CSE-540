# CSE 540 - Group 25 - Project 2

Decentralized Identity and Access Management (IAM) dApp

Maxwell Goisman, Abdullah Alzoabi, Nawaf Alsufiani, Ju-Won Hyun, Farhan Sadaf

## Our idea

We want to make a basic system for checking university credentials. A university issues a credential, a student can choose who to share it with, and an employer can check if it is real and still valid.

We are using a blockchain to keep track of approved universities and credential status. The actual academic information will stay off-chain instead of putting student records on a public blockchain.

This repo is our **smart contract draft**. The functions are planned out, but we have not built the full system yet.

## Main parts

- `IssuerRegistry.sol` - keeps track of which university accounts are allowed to issue credentials.
- `CredentialRegistry.sol` - keeps track of student DID hashes, issued credentials, and revocations.
- `contracts/interfaces/` - shows the functions we plan to use for both contracts.

## How it would work

1. An admin approves a university account.
2. A student registers a DID hash using their wallet.
3. The university signs a credential and records its ID and hash on Ethereum.
4. The student shares the credential with an employer off-chain.
5. The employer checks the signature, hash, approved issuer, and revocation status.
6. If needed, the university can revoke a credential it issued.

We also included an option to log a verification check as a blockchain event. The normal read-only validity check would not create an event.

## Tools we plan to use

- Ethereum - blockchain for the DID and credential status records
- Solidity (`^0.8.34`) - smart contracts
- Hardhat - local testing and gas measurements
- SHA-256 - making hashes of credential data before storing the hashes on-chain

We added a basic Hardhat setup so we can compile the draft. We will add tests when we start implementing the functions.

## How to check the draft with Hardhat

1. Download or clone this repo.
2. Install Node.js 22.13 or newer, if needed.
3. Open a terminal in this folder and run `npm install`.
4. Run `npm run compile` to check the Solidity files.

The main contracts are marked `abstract` because the functions are not implemented yet. They can be checked for compile errors, but they are not ready to deploy or use yet. We will add the function logic and tests in the next part of the project.

## What we still need to do

- Add checks so only the admin approves universities and only approved universities issue credentials.
- Let students register DIDs and stop duplicate credential IDs.
- Make sure only the issuing university can revoke a credential.
- Implement validity checks and event logging.
- Add digital signature verification in the application, plus basic testing and a simple interface.

For the class demo, we will use fake student and university data. We are not connecting to ASU or using real student records.
