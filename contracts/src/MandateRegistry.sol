// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISelfAgentRegistry {
    function balanceOf(address owner) external view returns (uint256);
    function isVerifiedAgent(bytes32 agentKey) external view returns (bool);
    function getAgentId(bytes32 agentKey) external view returns (uint256);
    function isProofFresh(uint256 agentId) external view returns (bool);
}

contract MandateRegistry {
    struct Mandate {
        address owner;
        address agent;
        bytes32[] allowedActions;
        uint256 expiresAt;
        uint256 maxValuePerAction;
        bool active;
    }

    ISelfAgentRegistry public immutable selfRegistry;

    mapping(uint256 => Mandate) public mandates;
    uint256 public nextMandateId;

    event MandateCreated(uint256 indexed mandateId, address indexed owner, address indexed agent);
    event MandateRevoked(uint256 indexed mandateId);

    constructor(address _selfRegistry) {
        selfRegistry = ISelfAgentRegistry(_selfRegistry);
    }

    /// @notice Create a mandate. Caller must have a Self Agent ID NFT (verified human).
    function createMandate(
        address agent,
        bytes32[] calldata allowedActions,
        uint256 expiresAt,
        uint256 maxValuePerAction
    ) external returns (uint256 mandateId) {
        require(agent != address(0), "invalid agent");
        require(expiresAt > block.timestamp, "already expired");
        require(allowedActions.length > 0, "no actions");
        require(
            selfRegistry.balanceOf(msg.sender) > 0,
            "caller has no Self Agent ID"
        );

        mandateId = nextMandateId++;
        Mandate storage m = mandates[mandateId];
        m.owner = msg.sender;
        m.agent = agent;
        m.allowedActions = allowedActions;
        m.expiresAt = expiresAt;
        m.maxValuePerAction = maxValuePerAction;
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
        bool active
    ) {
        Mandate storage m = mandates[mandateId];
        return (m.owner, m.agent, m.allowedActions, m.expiresAt, m.maxValuePerAction, m.active);
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

    /// @notice Live onchain check — does the mandate owner STILL have a Self Agent ID NFT?
    /// If the NFT is burned/revoked, this returns false even for existing mandates.
    function isHumanBacked(uint256 mandateId) external view returns (bool) {
        return selfRegistry.balanceOf(mandates[mandateId].owner) > 0;
    }
}
