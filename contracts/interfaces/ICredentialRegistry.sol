// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Functions for student IDs and university credentials.
interface ICredentialRegistry {
    event DIDRegistered(address indexed student, bytes32 didHash);
    event CredentialIssued(bytes32 indexed credentialId, address indexed issuer, address indexed student);
    event CredentialRevoked(bytes32 indexed credentialId);
    event CredentialVerified(bytes32 indexed credentialId, address indexed verifier, bool valid);

    // A student registers a hash for their DID.
    function registerDID(bytes32 didHash) external;

    // An approved university saves the ID and hash of a credential.
    function issueCredential(
        address student,
        bytes32 credentialId,
        bytes32 credentialHash
    ) external;

    // The university that issued a credential can revoke it.
    function revokeCredential(bytes32 credentialId) external;

    // Checks the hash and whether the credential is still valid.
    function isCredentialValid(
        bytes32 credentialId,
        bytes32 presentedCredentialHash
    ) external view returns (bool);

    // Same kind of check, but this will also save a verification event.
    function verifyAndLogCredential(
        bytes32 credentialId,
        bytes32 presentedCredentialHash
    ) external returns (bool);
}
