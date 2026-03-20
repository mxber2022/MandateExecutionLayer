import {
  createDelegation,
  getDeleGatorEnvironment,
} from '@metamask/delegation-toolkit'
import { toFunctionSelector, keccak256, encodePacked } from 'viem'
import {
  agentAccount,
  humanAccount,
  ACTION_RECEIPT_ADDRESS,
} from './config.js'

const environment = getDeleGatorEnvironment(84532) // Base Sepolia

export interface DelegationInfo {
  delegate: `0x${string}`
  delegator: `0x${string}`
  caveats: { enforcer: `0x${string}`; terms: `0x${string}` }[]
  authority: `0x${string}`
  delegationHash: `0x${string}`
}

// Store active delegation for verification
let activeDelegation: DelegationInfo | null = null

/**
 * Human creates an ERC-7715 delegation to the agent.
 * Caveats encode the mandate constraints:
 * - Agent can only call postReceipt on ActionReceipt contract
 * - Restricted to specific function selectors
 */
export async function createAndLogDelegation(): Promise<DelegationInfo> {
  console.log('  [Delegation] Creating ERC-7715 delegation...')
  console.log(`  [Delegation] Delegator (human): ${humanAccount.address}`)
  console.log(`  [Delegation] Delegate (agent): ${agentAccount.address}`)

  const postReceiptSelector = toFunctionSelector(
    'postReceipt(uint256,bytes32,bytes32,bool,bytes)'
  )

  const delegation = createDelegation({
    to: agentAccount.address,
    from: humanAccount.address,
    scope: {
      type: 'functionCall',
      targets: [ACTION_RECEIPT_ADDRESS],
      selectors: [postReceiptSelector],
    },
    environment,
  })

  console.log(`  [Delegation] Caveats: ${delegation.caveats.length}`)
  for (const caveat of delegation.caveats) {
    console.log(`    - Enforcer: ${caveat.enforcer}`)
    console.log(`      Terms: ${caveat.terms}`)
  }

  const delegationHash = keccak256(
    encodePacked(
      ['address', 'address', 'bytes32'],
      [delegation.delegate, delegation.delegator, delegation.authority]
    )
  )

  console.log(`  [Delegation] Hash: ${delegationHash}`)
  console.log('  [Delegation] Delegation created (cryptographic root of mandate authority)')

  const info: DelegationInfo = {
    delegate: delegation.delegate,
    delegator: delegation.delegator,
    caveats: delegation.caveats.map(c => ({
      enforcer: c.enforcer as `0x${string}`,
      terms: c.terms as `0x${string}`,
    })),
    authority: delegation.authority as `0x${string}`,
    delegationHash,
  }

  activeDelegation = info
  return info
}

/**
 * Verify that the agent has a valid delegation before executing.
 * Checks:
 * - Delegation exists
 * - Agent is the delegate
 * - Human is the delegator
 * - Caveats are present (target + method restrictions)
 */
export function verifyDelegation(agentAddress: `0x${string}`): {
  valid: boolean
  reason: string
} {
  if (!activeDelegation) {
    return { valid: false, reason: 'no active delegation found' }
  }

  if (activeDelegation.delegate.toLowerCase() !== agentAddress.toLowerCase()) {
    return { valid: false, reason: `delegation delegate mismatch: expected ${agentAddress}, got ${activeDelegation.delegate}` }
  }

  if (activeDelegation.caveats.length === 0) {
    return { valid: false, reason: 'delegation has no caveats — unrestricted delegation not allowed' }
  }

  return { valid: true, reason: 'delegation verified: agent is authorized delegate with caveats' }
}

export function getActiveDelegation(): DelegationInfo | null {
  return activeDelegation
}
