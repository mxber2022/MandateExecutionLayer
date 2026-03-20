// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ActionReceipt {
    struct Receipt {
        uint256 mandateId;
        bytes32 actionHash;
        bytes32 reasoningHash;
        bool compliant;
        uint256 timestamp;
        bytes agentSignature;
    }

    mapping(uint256 => Receipt[]) public receiptsByMandate;

    event ActionExecuted(uint256 indexed mandateId, bytes32 actionHash, bool compliant);

    function postReceipt(
        uint256 mandateId,
        bytes32 actionHash,
        bytes32 reasoningHash,
        bool compliant,
        bytes calldata agentSignature
    ) external {
        receiptsByMandate[mandateId].push(Receipt({
            mandateId: mandateId,
            actionHash: actionHash,
            reasoningHash: reasoningHash,
            compliant: compliant,
            timestamp: block.timestamp,
            agentSignature: agentSignature
        }));

        emit ActionExecuted(mandateId, actionHash, compliant);
    }

    function getReceipts(uint256 mandateId) external view returns (Receipt[] memory) {
        return receiptsByMandate[mandateId];
    }

    function getReceiptCount(uint256 mandateId) external view returns (uint256) {
        return receiptsByMandate[mandateId].length;
    }
}
