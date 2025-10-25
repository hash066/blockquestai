// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;


contract AnchorContract {
    struct Anchor {
        bytes32 root;
        bytes32 prevRoot;
        uint256 nonce;
        string bundleCID;
        uint256 timestamp;
        address sequencer;
        bool revoked;
    }

    mapping(bytes32 => Anchor) public anchors;
    mapping(uint256 => bytes32) public anchorsByNonce;
    uint256 public currentNonce;

    event RootAnchored(
        bytes32 indexed root,
        bytes32 prevRoot,
        uint256 nonce,
        string bundleCID,
        address sequencer
    );
    event RootRevoked(bytes32 indexed root, uint256 timestamp);

    function anchorRoot(
        bytes32 root,
        bytes32 prevRoot,
        uint256 nonce,
        string memory bundleCID
    ) external {
        require(anchors[root].timestamp == 0, "Root already anchored");
        require(nonce == currentNonce, "Invalid nonce");

        anchors[root] = Anchor({
            root: root,
            prevRoot: prevRoot,
            nonce: nonce,
            bundleCID: bundleCID,
            timestamp: block.timestamp,
            sequencer: msg.sender,
            revoked: false
        });

        anchorsByNonce[nonce] = root;
        currentNonce++;

        emit RootAnchored(root, prevRoot, nonce, bundleCID, msg.sender);
    }

    function revokeRoot(bytes32 root) external {
        require(anchors[root].timestamp != 0, "Root not found");
        require(!anchors[root].revoked, "Already revoked");
        require(anchors[root].sequencer == msg.sender, "Not authorized");

        anchors[root].revoked = true;
        emit RootRevoked(root, block.timestamp);
    }

    function getAnchor(bytes32 root) external view returns (Anchor memory) {
        return anchors[root];
    }

    function getAnchorByNonce(uint256 nonce) external view returns (Anchor memory) {
        return anchors[anchorsByNonce[nonce]];
    }
}
