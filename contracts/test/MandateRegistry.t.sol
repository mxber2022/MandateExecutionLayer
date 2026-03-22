// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MandateRegistry.sol";

// Mock Self Registry that returns balanceOf = 1 for verified addresses
contract MockSelfRegistry {
    mapping(address => uint256) public balances;

    function setBalance(address owner, uint256 bal) external {
        balances[owner] = bal;
    }

    function balanceOf(address owner) external view returns (uint256) {
        return balances[owner];
    }

    function isVerifiedAgent(bytes32) external pure returns (bool) { return false; }
    function getAgentId(bytes32) external pure returns (uint256) { return 0; }
    function isProofFresh(uint256) external pure returns (bool) { return false; }
}

contract MandateRegistryTest is Test {
    MandateRegistry registry;
    MockSelfRegistry mockSelf;
    address human = address(0x1);
    address agent = address(0x2);
    address unverified = address(0x3);

    function setUp() public {
        mockSelf = new MockSelfRegistry();
        mockSelf.setBalance(human, 1); // human is verified
        registry = new MandateRegistry(address(mockSelf));
    }

    function test_createMandate() public {
        bytes32[] memory actions = new bytes32[](2);
        actions[0] = keccak256("send_message");
        actions[1] = keccak256("query_api");

        vm.prank(human);
        uint256 id = registry.createMandate(agent, actions, block.timestamp + 1 days, 0.01 ether);

        assertEq(id, 0);
        assertTrue(registry.isMandateActive(id));
        assertTrue(registry.isHumanBacked(id));
        assertTrue(registry.isActionAllowed(id, keccak256("send_message")));
        assertFalse(registry.isActionAllowed(id, keccak256("transfer_funds")));
    }

    function test_rejectUnverifiedHuman() public {
        bytes32[] memory actions = new bytes32[](1);
        actions[0] = keccak256("send_message");

        vm.prank(unverified);
        vm.expectRevert("caller has no Self Agent ID");
        registry.createMandate(agent, actions, block.timestamp + 1 days, 0);
    }

    function test_revokeMandate() public {
        bytes32[] memory actions = new bytes32[](1);
        actions[0] = keccak256("send_message");

        vm.prank(human);
        uint256 id = registry.createMandate(agent, actions, block.timestamp + 1 days, 0);

        vm.prank(human);
        registry.revokeMandate(id);
        assertFalse(registry.isMandateActive(id));
    }

    function test_isHumanBackedLive() public {
        bytes32[] memory actions = new bytes32[](1);
        actions[0] = keccak256("send_message");

        vm.prank(human);
        uint256 id = registry.createMandate(agent, actions, block.timestamp + 1 days, 0);

        // Human is verified
        assertTrue(registry.isHumanBacked(id));

        // Simulate NFT burn — human loses Self Agent ID
        mockSelf.setBalance(human, 0);
        assertFalse(registry.isHumanBacked(id));
    }

    function test_expired() public {
        bytes32[] memory actions = new bytes32[](1);
        actions[0] = keccak256("send_message");

        vm.prank(human);
        uint256 id = registry.createMandate(agent, actions, block.timestamp + 1 hours, 0);

        vm.warp(block.timestamp + 2 hours);
        assertFalse(registry.isMandateActive(id));
    }

    function test_onlyOwnerCanRevoke() public {
        bytes32[] memory actions = new bytes32[](1);
        actions[0] = keccak256("send_message");

        vm.prank(human);
        uint256 id = registry.createMandate(agent, actions, block.timestamp + 1 days, 0);

        vm.prank(agent);
        vm.expectRevert("not owner");
        registry.revokeMandate(id);
    }
}
