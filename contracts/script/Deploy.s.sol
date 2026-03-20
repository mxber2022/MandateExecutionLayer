// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MandateRegistry.sol";
import "../src/ActionReceipt.sol";

contract Deploy is Script {
    // Self Agent ID Registry on Celo Sepolia
    address constant SELF_REGISTRY = 0x043DaCac8b0771DD5b444bCC88f2f8BBDBEdd379;

    function run() external {
        vm.startBroadcast();

        MandateRegistry registry = new MandateRegistry(SELF_REGISTRY);
        ActionReceipt receipt = new ActionReceipt();

        vm.stopBroadcast();

        console.log("MandateRegistry:", address(registry));
        console.log("ActionReceipt:", address(receipt));
        console.log("Self Registry:", SELF_REGISTRY);
    }
}
