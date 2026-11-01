// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Functions for approving university accounts.
interface IIssuerRegistry {
    event IssuerAuthorized(address indexed issuer);
    event IssuerAuthorizationRevoked(address indexed issuer);

    // Admin adds a university that can issue credentials.
    function authorizeIssuer(address issuer) external;

    // Admin removes a university from the approved list.
    function revokeIssuerAuthorization(address issuer) external;

    // Checks if a university is currently approved.
    function isAuthorizedIssuer(address issuer) external view returns (bool);
}
