// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IIssuerRegistry} from "./interfaces/IIssuerRegistry.sol";

// Keeps the list of universities that are allowed to issue credentials.
contract IssuerRegistry is IIssuerRegistry {
    address public admin;
    mapping(address => bool) internal approvedIssuers;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    // - Only the admin can approve or remove a university:
    // Admin adds a university that can issue credentials.
    function authorizeIssuer(address issuer) external onlyAdmin {
        //this checks for universites that are already approved/authorized
        require(issuer != address(0), "Invalid address");

        //if a university is already authorized then prints this message
        require(!approvedIssuers[issuer], "Already authorized");

        //this adds them to the approved list
        approvedIssuers[issuer] = true;

        //every change tracks via emit
        emit IssuerAuthorized(issuer);
    }

    // Admin removes a university from the approved list.
    function revokeIssuerAuthorization(address issuer) external onlyAdmin {
        require(issuer != address(0), "Invalid address");

        //rejects invalid wallet of university if trying to remove unauthrorized university in approved list
        require(approvedIssuers[issuer], "Not authorized");

        //removes from the list
        approvedIssuers[issuer] = false;

        //every change tracks via emi
        emit IssuerAuthorizationRevoked(issuer);
    }

    // Checks if a university is currently approved and anyone can call this
    function isAuthorizedIssuer(address issuer) external view returns (bool) {
        return approvedIssuers[issuer];
    }
}
