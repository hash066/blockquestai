// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DIDRegistry {
    struct DIDRecord {
        address wallet;
        uint256 reputation;
        uint256 quota;
        bool active;
        uint256 registeredAt;
    }

    mapping(string => DIDRecord) public dids;
    mapping(address => string) public walletToDID;

    event DIDRegistered(string indexed did, address wallet);
    event DIDUpdated(string indexed did, uint256 reputation, uint256 quota);
    event DIDRevoked(string indexed did);

    function registerDID(string memory did, address wallet) external {
        require(dids[did].wallet == address(0), "DID already registered");
        require(bytes(walletToDID[wallet]).length == 0, "Wallet already registered");

        dids[did] = DIDRecord({
            wallet: wallet,
            reputation: 100,
            quota: 1000,
            active: true,
            registeredAt: block.timestamp
        });

        walletToDID[wallet] = did;
        emit DIDRegistered(did, wallet);
    }

    function updateReputation(string memory did, uint256 newReputation) external {
        require(dids[did].active, "DID not active");
        dids[did].reputation = newReputation;
        emit DIDUpdated(did, newReputation, dids[did].quota);
    }

    function updateQuota(string memory did, uint256 newQuota) external {
        require(dids[did].active, "DID not active");
        dids[did].quota = newQuota;
        emit DIDUpdated(did, dids[did].reputation, newQuota);
    }

    function revokeDID(string memory did) external {
        require(dids[did].active, "DID already revoked");
        dids[did].active = false;
        emit DIDRevoked(did);
    }

    function getDID(string memory did) external view returns (DIDRecord memory) {
        return dids[did];
    }

    function getDIDByWallet(address wallet) external view returns (DIDRecord memory) {
        string memory did = walletToDID[wallet];
        return dids[did];
    }
}
