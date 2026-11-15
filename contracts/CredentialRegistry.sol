// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {ICredentialRegistry} from "./interfaces/ICredentialRegistry.sol";
import {IIssuerRegistry} from "./interfaces/IIssuerRegistry.sol";

// Keeps track of student DIDs and the credentials universities issue to them.
// Only hashes are stored here. The real student records stay off-chain.
contract CredentialRegistry is ICredentialRegistry {
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
        require(issuerRegistryAddress != address(0), "Invalid registry address");
        issuerRegistry = IIssuerRegistry(issuerRegistryAddress);
    }

    // A student registers a hash for their DID using their own wallet.
    function registerDID(bytes32 didHash) external {
        require(didHash != bytes32(0), "Invalid DID hash");
        require(studentDIDs[msg.sender] == bytes32(0), "DID already registered");
        studentDIDs[msg.sender] = didHash;
        emit DIDRegistered(msg.sender, didHash);
    }

    // An approved university saves the ID and hash of a credential.
    function issueCredential(
        address student,
        bytes32 credentialId,
        bytes32 credentialHash
    ) external {
        require(issuerRegistry.isAuthorizedIssuer(msg.sender), "Not an approved university");
        require(student != address(0), "Invalid student address");
        require(studentDIDs[student] != bytes32(0), "Student has no DID");
        require(credentialId != bytes32(0), "Invalid credential ID");
        require(credentialHash != bytes32(0), "Invalid credential hash");
        require(!credentials[credentialId].exists, "Credential ID already used");

        credentials[credentialId] = Credential({
            student: student,
            issuer: msg.sender,
            credentialHash: credentialHash,
            revoked: false,
            exists: true
        });
        emit CredentialIssued(credentialId, msg.sender, student);
    }

    // The university that issued a credential can revoke it.
    function revokeCredential(bytes32 credentialId) external {
        Credential storage cred = credentials[credentialId];
        require(cred.exists, "Credential does not exist");
        require(cred.issuer == msg.sender, "Only the issuing university");
        require(!cred.revoked, "Already revoked");
        cred.revoked = true;
        emit CredentialRevoked(credentialId);
    }

    // Checks the hash and whether the credential is still valid. Free to call.
    function isCredentialValid(
        bytes32 credentialId,
        bytes32 presentedCredentialHash
    ) public view returns (bool) {
        Credential storage cred = credentials[credentialId];
        return cred.exists
            && !cred.revoked
            && cred.credentialHash == presentedCredentialHash
            && issuerRegistry.isAuthorizedIssuer(cred.issuer);
    }

    // Same check, but also saves a verification event on-chain.
    function verifyAndLogCredential(
        bytes32 credentialId,
        bytes32 presentedCredentialHash
    ) external returns (bool) {
        bool valid = isCredentialValid(credentialId, presentedCredentialHash);
        emit CredentialVerified(credentialId, msg.sender, valid);
        return valid;
    }
}
