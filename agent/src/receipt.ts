import { keccak256, encodePacked, toHex } from 'viem'
import {
  publicClient,
  agentWalletClient,
  agentAccount,
  ACTION_RECEIPT_ADDRESS,
  ACTION_RECEIPT_ABI,
} from './config.js'

export async function postReceipt(
  mandateId: bigint,
  actionHash: `0x${string}`,
  reasoningHash: `0x${string}`,
  compliant: boolean
): Promise<`0x${string}`> {
  // Sign the action hash as agent attestation
  const signature = await agentAccount.signMessage({
    message: { raw: actionHash },
  })

  const txHash = await agentWalletClient.writeContract({
    address: ACTION_RECEIPT_ADDRESS,
    abi: ACTION_RECEIPT_ABI,
    functionName: 'postReceipt',
    args: [mandateId, actionHash, reasoningHash, compliant, signature],
  })

  await publicClient.waitForTransactionReceipt({ hash: txHash })
  return txHash
}

export async function getReceipts(mandateId: bigint) {
  return publicClient.readContract({
    address: ACTION_RECEIPT_ADDRESS,
    abi: ACTION_RECEIPT_ABI,
    functionName: 'getReceipts',
    args: [mandateId],
  })
}
