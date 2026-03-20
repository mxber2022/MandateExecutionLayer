// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ActionReceipt.sol";

contract ActionReceiptTest is Test {
    ActionReceipt receipt;

    function setUp() public {
        receipt = new ActionReceipt();
    }

    function test_postAndGetReceipt() public {
        bytes memory sig = hex"deadbeef";
        receipt.postReceipt(0, keccak256("send_message"), keccak256("reasoning"), true, sig);
        receipt.postReceipt(0, keccak256("transfer_funds"), keccak256("blocked_reasoning"), false, sig);

        ActionReceipt.Receipt[] memory receipts = receipt.getReceipts(0);
        assertEq(receipts.length, 2);
        assertTrue(receipts[0].compliant);
        assertFalse(receipts[1].compliant);
        assertEq(receipt.getReceiptCount(0), 2);
    }
}
