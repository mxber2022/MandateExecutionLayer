// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MandateRegistry {
    struct Mandate {
        address owner;
        address agent;
        bytes32[] allowedActions;
        uint256 expiresAt;
        uint256 maxValuePerAction;
        bytes32 selfProofHash;
        bool active;
    }

    mapping(uint256 => Mandate) public mandates;
    uint256 public nextMandateId;

    event MandateCreated(uint256 indexed mandateId, address indexed owner, address indexed agent);
    event MandateRevoked(uint256 indexed mandateId);

    function createMandate(
        address agent,
        bytes32[] calldata allowedActions,
        uint256 expiresAt,
        uint256 maxValuePerAction,
        bytes32 selfProofHash
    ) external returns (uint256 mandateId) {
        require(agent != address(0), "invalid agent");
        require(expiresAt > block.timestamp, "already expired");
        require(allowedActions.length > 0, "no actions");

        mandateId = nextMandateId++;
        Mandate storage m = mandates[mandateId];
        m.owner = msg.sender;
        m.agent = agent;
        m.allowedActions = allowedActions;
        m.expiresAt = expiresAt;
        m.maxValuePerAction = maxValuePerAction;
        m.selfProofHash = selfProofHash;
        m.active = true;

        emit MandateCreated(mandateId, msg.sender, agent);
    }

    function revokeMandate(uint256 mandateId) external {
        require(mandates[mandateId].owner == msg.sender, "not owner");
        require(mandates[mandateId].active, "already revoked");
        mandates[mandateId].active = false;
        emit MandateRevoked(mandateId);
    }

    function getMandate(uint256 mandateId) external view returns (
        address owner,
        address agent,
        bytes32[] memory allowedActions,
        uint256 expiresAt,
        uint256 maxValuePerAction,
        bytes32 selfProofHash,
        bool active
    ) {
        Mandate storage m = mandates[mandateId];
        return (m.owner, m.agent, m.allowedActions, m.expiresAt, m.maxValuePerAction, m.selfProofHash, m.active);
    }

    function isActionAllowed(uint256 mandateId, bytes32 actionHash) external view returns (bool) {
        bytes32[] storage actions = mandates[mandateId].allowedActions;
        for (uint256 i = 0; i < actions.length; i++) {
            if (actions[i] == actionHash) return true;
        }
        return false;
    }

    function isMandateActive(uint256 mandateId) external view returns (bool) {
        Mandate storage m = mandates[mandateId];
        return m.active && block.timestamp < m.expiresAt;
    }

    function isHumanBacked(uint256 mandateId) external view returns (bool) {
        return mandates[mandateId].selfProofHash != bytes32(0);
    }
}
