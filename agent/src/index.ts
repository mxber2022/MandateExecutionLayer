import { keccak256, encodePacked } from 'viem'
import { agentAccount } from './config.js'
import { fetchMandate, localMandateCheck, hashAction } from './mandate.js'
import { checkCompliance, type ComplianceDecision } from './venice.js'
import { postReceipt } from './receipt.js'
import { executeAction, type Action } from './executor.js'
import { appendLog, type LogEntry } from './logger.js'
import { verifyDelegation } from './delegation.js'

// Known action name mappings (for Venice readable context)
const ACTION_NAMES: Record<string, string> = {}

export function registerActionNames(names: string[]) {
  for (const name of names) {
    ACTION_NAMES[hashAction(name)] = name
  }
}

export async function executeWithMandate(
  mandateId: bigint,
  proposedAction: Action
): Promise<{ executed: boolean; txHash: string | null; reason: string }> {
  console.log(`\n--- Action: "${proposedAction.type}" (mandate #${mandateId}) ---`)

  // 1. Verify delegation
  const delegationCheck = verifyDelegation(agentAccount.address)
  console.log(`  Delegation: ${delegationCheck.valid ? 'VALID' : 'INVALID'} — ${delegationCheck.reason}`)
  if (!delegationCheck.valid) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      mandateId: Number(mandateId),
      proposedAction: { type: proposedAction.type, params: proposedAction.params },
      localCheck: `failed — ${delegationCheck.reason}`,
      veniceDecision: null,
      executed: false,
      receiptTxHash: null,
    }
    appendLog(logEntry)
    return { executed: false, txHash: null, reason: delegationCheck.reason }
  }

  // 2. Fetch mandate from chain
  const mandate = await fetchMandate(mandateId)
  console.log(`  Mandate owner: ${mandate.owner}`)
  console.log(`  Human-backed: ${mandate.selfProofHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'}`)

  // 3. Local pre-checks
  const localCheck = localMandateCheck(
    mandate,
    proposedAction.type,
    BigInt(proposedAction.estimatedValue || 0)
  )
  console.log(`  Local check: ${localCheck.passed ? 'PASSED' : 'FAILED'} — ${localCheck.reason}`)

  const actionHash = hashAction(proposedAction.type)
  let veniceDecision: ComplianceDecision | null = null
  let executed = false
  let txHash: string | null = null

  if (!localCheck.passed) {
    // Post blocked receipt
    const reasoningHash = keccak256(encodePacked(['string'], [localCheck.reason]))
    txHash = await postReceipt(mandateId, actionHash, reasoningHash, false)
    console.log(`  BLOCKED — receipt tx: ${txHash}`)
  } else {
    // 4. Venice private compliance check
    console.log('  Checking compliance via Venice...')
    // Resolve readable action names for Venice
    const allowedActionNames = mandate.allowedActions
      .map(a => ACTION_NAMES[a as string])
      .filter((n): n is string => !!n)

    veniceDecision = await checkCompliance(
      {
        allowedActions: mandate.allowedActions.map(a => a as string),
        allowedActionNames,
        expiresAt: mandate.expiresAt,
        maxValuePerAction: mandate.maxValuePerAction,
        selfProofHash: mandate.selfProofHash,
      },
      proposedAction
    )
    console.log(`  Venice: ${veniceDecision.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'} (confidence: ${veniceDecision.confidence}) — ${veniceDecision.reason}`)

    const reasoningHash = keccak256(encodePacked(['string'], [veniceDecision.reason]))

    if (!veniceDecision.compliant) {
      txHash = await postReceipt(mandateId, actionHash, reasoningHash, false)
      console.log(`  BLOCKED by Venice — receipt tx: ${txHash}`)
    } else {
      // 5. Execute
      const result = await executeAction(proposedAction)
      executed = result.success

      // 6. Post compliant receipt
      txHash = await postReceipt(mandateId, actionHash, reasoningHash, true)
      console.log(`  EXECUTED — receipt tx: ${txHash}`)
    }
  }

  // 7. Log
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    mandateId: Number(mandateId),
    proposedAction: { type: proposedAction.type, params: proposedAction.params },
    localCheck: localCheck.passed ? 'passed' : `failed — ${localCheck.reason}`,
    veniceDecision,
    executed,
    receiptTxHash: txHash,
  }
  appendLog(logEntry)

  return { executed, txHash, reason: veniceDecision?.reason || localCheck.reason }
}
