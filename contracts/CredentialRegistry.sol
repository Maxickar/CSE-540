// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {ICredentialRegistry} from "./interfaces/ICredentialRegistry.sol";
import {IIssuerRegistry} from "./interfaces/IIssuerRegistry.sol";

// Draft for keeping track of student DIDs and credentials.
abstract contract CredentialRegistry is ICredentialRegistry {
    struct Credential {
        address student;
        address issuer;
        bytes32 credentialHash;
        bool revoked;
        bool exists;
    }

    IIssuerRegistry public issuerRegistry;
    mapping(address => bytes32) internal studentDIDs;
    mapping(bytes32 => Credential) internal credentials;

    constructor(address issuerRegistryAddress) {
        issuerRegistry = IIssuerRegistry(issuerRegistryAddress);
    }

    // Plan:
    // - Students will register their own DID hashes using their wallet.
    // - Only approved universities can issue credentials.
    // - A credential ID cannot be registered twice.
    // - Only the university that issued it can revoke it.
    // - Validity checks will compare the hash and check revocation.
    // - The app will check the actual digital signature off-chain.
    // - We will log important actions without saving student records here.
}
