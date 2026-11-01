# Project 2: Decentralized Identity and Access Management (IAM) dApp

In our project, we aim to develop a decentralized credential system where users, students, are able to gain access to their own credentials, instead of having a user be reliant on centralized authorities maintaining their information. Our basic workflow starts with a university gaining authorization to issue credentials from IssuerRegistry.sol. CredentialRegistry.sol is then able to register student DID hashes and store credential hashes into the database, where when a student authenticates themselves, an employer is able to verify their credentials to see handle credential revocation and validity checks. Ultimately, students are given more control over their information using a decentralized system rather than having to trust a universities centralized database to store all their information in.




# Usage:
University: Issues digitally signed academic credentials and can revoke credentials when necessary

Student: Registers a decentralized identifier, receives credentials, and decides when and with whom to share them

Employer: Checks the credential’s signature(integrity), issuer signature, issuer authorization, and revocation status


# Dependencies Used:
Ethereum: Stores shared DID, issuer, and credential-status records

Solidity: Creates smart contracts to register identities and manage credentials

HardHat: Runs and tests smart contracts locally and measures gas usage

SHA-256: Generates credential hashes for integrity checking


*This repository is currently a draft. Exact dependency versions and network configuration will be added as development proceeds.
