// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IIssuerRegistry} from "./interfaces/IIssuerRegistry.sol";

// This is just the draft. We will add the function code later.
abstract contract IssuerRegistry is IIssuerRegistry {
    address public admin;
    mapping(address => bool) internal approvedIssuers;

    constructor() {
        admin = msg.sender;
    }

    // Plan:
    // - Only the admin can approve or remove a university.
    // - We will reject invalid wallet addresses.
    // - Every change should send an event so it can be tracked.
    // - isAuthorizedIssuer will check approvedIssuers.
}
