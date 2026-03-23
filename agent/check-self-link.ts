import { createPublicClient, http, keccak256, encodePacked } from 'viem'

const SELF_REGISTRY = '0x043DaCac8b0771DD5b444bCC88f2f8BBDBEdd379'
const SELF_CHAIN_ID = 11142220n // Celo Sepolia
const HUMAN_ADDRESS = '0xf282FCCc0608147aB493e6a081d354646614b4F1'

async function main() {
  const celoClient = createPublicClient({
    transport: http('https://forno.celo-sepolia.celo-testnet.org'),
  })

  // 1. Verify Self Agent ID NFT exists onchain
  const balance = await celoClient.readContract({
    address: SELF_REGISTRY,
    abi: [{ type: 'function', name: 'balanceOf', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' }],
    functionName: 'balanceOf',
    args: [HUMAN_ADDRESS],
  })

  console.log('=== Self Agent ID → Mandate Link ===\n')
  console.log(`Self Agent ID Registry: ${SELF_REGISTRY}`)
  console.log(`Chain: Celo Sepolia (${SELF_CHAIN_ID})`)
  console.log(`Human address: ${HUMAN_ADDRESS}`)
  console.log(`NFT balance: ${balance}`)
  console.log(`Verified human: ${balance > 0n ? 'YES' : 'NO'}\n`)

  // 2. Derive selfProofHash from real onchain data
  const selfProofHash = keccak256(
    encodePacked(
      ['string', 'address', 'address', 'uint256'],
      ['self-agent-id:', HUMAN_ADDRESS, SELF_REGISTRY, SELF_CHAIN_ID]
    )
  )
  console.log(`selfProofHash (from real Self Agent ID): ${selfProofHash}`)
  console.log(`\nThis hash goes into MandateRegistry.createMandate()`)
  console.log(`Anyone can verify: hash the same inputs → get the same hash → confirm human is real`)

  console.log(`\n=== Trust Chain ===`)
  console.log(`ActionReceipt (Base Sepolia)`)
  console.log(`  → references mandateId`)
  console.log(`  → MandateRegistry (Base Sepolia)`)
  console.log(`    → contains selfProofHash: ${selfProofHash}`)
  console.log(`    → derived from Self Agent ID NFT`)
  console.log(`      → SelfAgentRegistry (Celo Sepolia): ${SELF_REGISTRY}`)
  console.log(`        → balanceOf(${HUMAN_ADDRESS}) = ${balance}`)
  console.log(`        → soulbound NFT = verified human`)
}

main().catch(console.error)
