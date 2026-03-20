// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MandateRegistry.sol";
import "../src/ActionReceipt.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        MandateRegistry registry = new MandateRegistry();
        ActionReceipt receipt = new ActionReceipt();

        vm.stopBroadcast();

        console.log("MandateRegistry:", address(registry));
        console.log("ActionReceipt:", address(receipt));
    }
}
