import { keccak256, encodePacked, parseEther } from 'viem'
import {
  publicClient,
  humanWalletClient,
  agentAccount,
  humanAccount,
  MANDATE_REGISTRY_ADDRESS,
  MANDATE_REGISTRY_ABI,
  ACTION_RECEIPT_ADDRESS,
} from './src/config.js'
import { executeWithMandate, registerActionNames } from './src/index.js'
import { getReceipts } from './src/receipt.js'
import { getLogs } from './src/logger.js'
import { verifySelfProof } from './src/self.js'
import { createAndLogDelegation } from './src/delegation.js'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║         MANDATE EXECUTION LAYER — DEMO              ║')
  console.log('║  A primitive for bounded agent authority with        ║')
  console.log('║  verifiable onchain compliance                      ║')
  console.log('╚══════════════════════════════════════════════════════╝\n')

  // ── STEP 1: Self Protocol — Personhood Verification ──
  console.log('━━━ STEP 1: PERSONHOOD LAYER (Self Protocol) ━━━')
  console.log('Human verifies identity via ZK passport proof')
  const selfResult = await verifySelfProof(humanAccount.address)
  if (!selfResult.valid || !selfResult.selfProofHash) {
    throw new Error('Self verification failed')
  }
  const selfProofHash = selfResult.selfProofHash
  console.log(`  Provider: ${selfResult.provider}`)
  console.log(`  selfProofHash: ${selfProofHash}`)
  console.log('  Anti-sybil: one human = one verified mandate creator\n')

  // ── STEP 2: MetaMask Delegation — Cryptographic Authority ──
  console.log('━━━ STEP 2: DELEGATION LAYER (MetaMask ERC-7715) ━━━')
  const delegationInfo = await createAndLogDelegation()
  console.log()

  // ── STEP 3: Create Mandate Onchain ──
  console.log('━━━ STEP 3: MANDATE LAYER (Onchain State) ━━━')
  console.log('Human creates mandate: bounded authority for agent')
  const allowedActions = [
    keccak256(encodePacked(['string'], ['send_message'])),
    keccak256(encodePacked(['string'], ['query_api'])),
  ]
  const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 86400)
  const maxValue = parseEther('0.01')

  const createTxHash = await humanWalletClient.writeContract({
    address: MANDATE_REGISTRY_ADDRESS,
    abi: MANDATE_REGISTRY_ABI,
    functionName: 'createMandate',
    args: [agentAccount.address, allowedActions, expiresAt, maxValue, selfProofHash],
  })
  const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createTxHash })
  console.log(`  Mandate creation tx: ${createTxHash}`)
  console.log(`  Block: ${createReceipt.blockNumber}`)

  const nextId = await publicClient.readContract({
    address: MANDATE_REGISTRY_ADDRESS,
    abi: MANDATE_REGISTRY_ABI,
    functionName: 'nextMandateId',
  })
  const mandateId = nextId - 1n
  console.log(`  Mandate ID: ${mandateId}`)

  const isHuman = await publicClient.readContract({
    address: MANDATE_REGISTRY_ADDRESS,
    abi: MANDATE_REGISTRY_ABI,
    functionName: 'isHumanBacked',
    args: [mandateId],
  })
  const isActive = await publicClient.readContract({
    address: MANDATE_REGISTRY_ADDRESS,
    abi: MANDATE_REGISTRY_ABI,
    functionName: 'isMandateActive',
    args: [mandateId],
  })
  console.log(`  Human-backed: ${isHuman}`)
  console.log(`  Active: ${isActive}`)
  console.log(`  Allowed actions: send_message, query_api`)
  console.log(`  Max value per action: 0.01 ETH`)
  console.log(`  Expires: ${new Date(Number(expiresAt) * 1000).toISOString()}\n`)

  // Register readable action names for Venice reasoning
  registerActionNames(['send_message', 'query_api', 'transfer_funds', 'admin_override'])

  // ── STEP 4: Agent Execution Loop ──
  console.log('━━━ STEP 4: REASONING + RECEIPT LAYERS (Agent Loop) ━━━')
  console.log('Agent processes actions — compliant ones execute, others get blocked\n')

  // Action 1: IN-MANDATE — send_message
  console.log('▶ Action 1: "send_message" (IN MANDATE)')
  await executeWithMandate(mandateId, {
    type: 'send_message',
    params: { to: 'user@example.com', body: 'Hello from mandated agent' },
  })

  // Action 2: OUT-OF-MANDATE — transfer_funds
  console.log('\n▶ Action 2: "transfer_funds" (OUT OF MANDATE)')
  await executeWithMandate(mandateId, {
    type: 'transfer_funds',
    params: { to: '0xdeadbeef', amount: '1.0 ETH' },
  })

  // Action 3: IN-MANDATE — query_api
  console.log('\n▶ Action 3: "query_api" (IN MANDATE)')
  await executeWithMandate(mandateId, {
    type: 'query_api',
    params: { endpoint: '/api/data', method: 'GET' },
  })

  // Action 4: OUT-OF-MANDATE — admin_override
  console.log('\n▶ Action 4: "admin_override" (OUT OF MANDATE)')
  await executeWithMandate(mandateId, {
    type: 'admin_override',
    params: { action: 'delete_all_users' },
  })

  // ── STEP 5: Mandate Revocation ──
  console.log('\n\n━━━ STEP 5: MANDATE REVOCATION ━━━')
  console.log('Human revokes mandate — agent should be blocked on all subsequent actions')

  const revokeTxHash = await humanWalletClient.writeContract({
    address: MANDATE_REGISTRY_ADDRESS,
    abi: MANDATE_REGISTRY_ABI,
    functionName: 'revokeMandate',
    args: [mandateId],
  })
  await publicClient.waitForTransactionReceipt({ hash: revokeTxHash })
  console.log(`  Revocation tx: ${revokeTxHash}`)

  const isActiveAfterRevoke = await publicClient.readContract({
    address: MANDATE_REGISTRY_ADDRESS,
    abi: MANDATE_REGISTRY_ABI,
    functionName: 'isMandateActive',
    args: [mandateId],
  })
  console.log(`  Mandate active after revoke: ${isActiveAfterRevoke}`)

  // Action 5: Post-revocation — should be blocked
  console.log('\n▶ Action 5: "send_message" (AFTER REVOCATION — should be blocked)')
  await executeWithMandate(mandateId, {
    type: 'send_message',
    params: { to: 'user@example.com', body: 'This should fail' },
  })

  // ── VERIFICATION ──
  console.log('\n\n━━━ VERIFICATION: Onchain Receipts ━━━')
  const receipts = await getReceipts(mandateId)
  console.log(`Total receipts for mandate #${mandateId}: ${receipts.length}`)
  for (let i = 0; i < receipts.length; i++) {
    const r = receipts[i]
    console.log(`\n  Receipt #${i}:`)
    console.log(`    Action hash:     ${r.actionHash}`)
    console.log(`    Compliant:       ${r.compliant}`)
    console.log(`    Timestamp:       ${new Date(Number(r.timestamp) * 1000).toISOString()}`)
    console.log(`    Reasoning hash:  ${r.reasoningHash}`)
  }

  // ── TRUST CHAIN ──
  console.log('\n\n━━━ FULL TRUST CHAIN ━━━')
  console.log('  receipt → mandate → Self proof → verified human\n')
  console.log(`  Personhood:       Self Protocol (ZK passport)`)
  console.log(`  selfProofHash:    ${selfProofHash}`)
  console.log(`  Mandate:          MandateRegistry @ ${MANDATE_REGISTRY_ADDRESS}`)
  console.log(`  Mandate ID:       ${mandateId}`)
  console.log(`  Identity:         Agent @ ${agentAccount.address}`)
  console.log(`  Receipts:         ActionReceipt @ ${ACTION_RECEIPT_ADDRESS}`)
  console.log(`  Delegation:       MetaMask ERC-7715`)
  console.log(`    Delegator:      ${delegationInfo.delegator}`)
  console.log(`    Delegate:       ${delegationInfo.delegate}`)
  console.log(`    Caveats:        ${delegationInfo.caveats.length}`)
  console.log(`    Hash:           ${delegationInfo.delegationHash}`)
  console.log(`  Reasoning:        Venice AI (private, no data retention)`)
  console.log(`  Human-backed:     ${isHuman}`)

  // ── AGENT LOG ──
  console.log('\n\n━━━ AGENT LOG SUMMARY ━━━')
  const logs = getLogs()
  for (const log of logs) {
    const status = log.executed ? '✓ EXECUTED' : '✗ BLOCKED'
    console.log(`  [${log.timestamp}] ${log.proposedAction.type.padEnd(16)} ${status}  tx: ${log.receiptTxHash || 'n/a'}`)
  }

  // Write final agent_log.json with full metadata
  const finalLog = {
    agent: {
      address: agentAccount.address,
      mandateRegistry: MANDATE_REGISTRY_ADDRESS,
      actionReceipt: ACTION_RECEIPT_ADDRESS,
      chain: 'base-sepolia',
      chainId: 84532,
    },
    mandate: {
      id: Number(mandateId),
      owner: humanAccount.address,
      selfProofHash,
      allowedActions: ['send_message', 'query_api'],
      expiresAt: new Date(Number(expiresAt) * 1000).toISOString(),
      maxValuePerAction: '0.01 ETH',
      humanBacked: isHuman,
      creationTx: createTxHash,
      revocationTx: revokeTxHash,
    },
    delegation: {
      framework: 'metamask-erc7715',
      delegator: delegationInfo.delegator,
      delegate: delegationInfo.delegate,
      caveats: delegationInfo.caveats.length,
      delegationHash: delegationInfo.delegationHash,
    },
    trustChain: 'receipt → mandate → Self proof → verified human',
    logs: logs,
  }
  writeFileSync(join(__dirname, 'agent_log.json'), JSON.stringify(finalLog, null, 2))
  console.log('\n  agent_log.json written with full metadata')

  // Summary stats
  const executed = logs.filter(l => l.executed).length
  const blocked = logs.filter(l => !l.executed).length
  console.log(`\n  Total actions: ${logs.length}`)
  console.log(`  Executed: ${executed}`)
  console.log(`  Blocked: ${blocked}`)
  console.log(`  Onchain receipts: ${receipts.length}`)

  console.log('\n╔══════════════════════════════════════════════════════╗')
  console.log('║                    DEMO COMPLETE                     ║')
  console.log('╚══════════════════════════════════════════════════════╝')
}

main().catch(console.error)
