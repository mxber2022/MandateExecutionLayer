// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MandateRegistry.sol";

contract MandateRegistryTest is Test {
    MandateRegistry registry;
    address human = address(0x1);
    address agent = address(0x2);

    function setUp() public {
        registry = new MandateRegistry();
    }

    function test_createMandate() public {
        bytes32[] memory actions = new bytes32[](2);
        actions[0] = keccak256("send_message");
        actions[1] = keccak256("query_api");
        bytes32 selfProof = keccak256("fake_self_proof");

        vm.prank(human);
        uint256 id = registry.createMandate(agent, actions, block.timestamp + 1 days, 0.01 ether, selfProof);

        assertEq(id, 0);
        assertTrue(registry.isMandateActive(id));
        assertTrue(registry.isHumanBacked(id));
        assertTrue(registry.isActionAllowed(id, keccak256("send_message")));
        assertFalse(registry.isActionAllowed(id, keccak256("transfer_funds")));
    }

    function test_revokeMandate() public {
        bytes32[] memory actions = new bytes32[](1);
        actions[0] = keccak256("send_message");

        vm.prank(human);
        uint256 id = registry.createMandate(agent, actions, block.timestamp + 1 days, 0, bytes32(0));

        vm.prank(human);
        registry.revokeMandate(id);
        assertFalse(registry.isMandateActive(id));
    }

    function test_notHumanBacked() public {
        bytes32[] memory actions = new bytes32[](1);
        actions[0] = keccak256("send_message");

        vm.prank(human);
        uint256 id = registry.createMandate(agent, actions, block.timestamp + 1 days, 0, bytes32(0));

        assertFalse(registry.isHumanBacked(id));
    }

    function test_expired() public {
        bytes32[] memory actions = new bytes32[](1);
        actions[0] = keccak256("send_message");

        vm.prank(human);
        uint256 id = registry.createMandate(agent, actions, block.timestamp + 1 hours, 0, bytes32(0));

        vm.warp(block.timestamp + 2 hours);
        assertFalse(registry.isMandateActive(id));
    }

    function test_onlyOwnerCanRevoke() public {
        bytes32[] memory actions = new bytes32[](1);
        actions[0] = keccak256("send_message");

        vm.prank(human);
        uint256 id = registry.createMandate(agent, actions, block.timestamp + 1 days, 0, bytes32(0));

        vm.prank(agent);
        vm.expectRevert("not owner");
        registry.revokeMandate(id);
    }
}
