import { createPublicClient, http } from 'viem'
import { SELF_REGISTRY_ADDRESS } from './config.js'

const CELO_RPC = 'https://forno.celo-sepolia.celo-testnet.org'

const celoClient = createPublicClient({
  transport: http(CELO_RPC),
})

export interface SelfVerificationResult {
  valid: boolean
  nftBalance: number
  registry: string
  chainId: number
}

/**
 * Check if a human has a Self Agent ID NFT onchain.
 * This is just a read — the real enforcement is in MandateRegistry.createMandate()
 * which calls selfRegistry.balanceOf(msg.sender) directly.
 */
export async function verifySelfAgentId(humanAddress: string): Promise<SelfVerificationResult> {
  console.log(`  [Self Protocol] Checking Self Agent ID for ${humanAddress}`)
  console.log(`  [Self Protocol] Registry: ${SELF_REGISTRY_ADDRESS} (Celo Sepolia)`)

  try {
    const balance = await celoClient.readContract({
      address: SELF_REGISTRY_ADDRESS,
      abi: [{
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
      }],
      functionName: 'balanceOf',
      args: [humanAddress as `0x${string}`],
    })

    const hasNFT = balance > 0n
    console.log(`  [Self Protocol] NFT balance: ${balance} — ${hasNFT ? 'VERIFIED HUMAN' : 'NOT VERIFIED'}`)

    return {
      valid: hasNFT,
      nftBalance: Number(balance),
      registry: SELF_REGISTRY_ADDRESS,
      chainId: 11142220,
    }
  } catch (err) {
    console.log(`  [Self Protocol] Error: ${err instanceof Error ? err.message : err}`)
    return { valid: false, nftBalance: 0, registry: SELF_REGISTRY_ADDRESS, chainId: 11142220 }
  }
}
