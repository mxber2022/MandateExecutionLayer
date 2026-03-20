import { keccak256, encodePacked } from 'viem'
import {
  publicClient,
  agentAccount,
  MANDATE_REGISTRY_ADDRESS,
  MANDATE_REGISTRY_ABI,
} from './config.js'

export interface MandateData {
  owner: `0x${string}`
  agent: `0x${string}`
  allowedActions: readonly `0x${string}`[]
  expiresAt: bigint
  maxValuePerAction: bigint
  active: boolean
}

export interface LocalCheckResult {
  passed: boolean
  reason: string
}

export async function fetchMandate(mandateId: bigint): Promise<MandateData> {
  const result = await publicClient.readContract({
    address: MANDATE_REGISTRY_ADDRESS,
    abi: MANDATE_REGISTRY_ABI,
    functionName: 'getMandate',
    args: [mandateId],
  })

  const [owner, agent, allowedActions, expiresAt, maxValuePerAction, active] = result
  return { owner, agent, allowedActions, expiresAt, maxValuePerAction, active }
}

export async function isHumanBacked(mandateId: bigint): Promise<boolean> {
  return publicClient.readContract({
    address: MANDATE_REGISTRY_ADDRESS,
    abi: MANDATE_REGISTRY_ABI,
    functionName: 'isHumanBacked',
    args: [mandateId],
  })
}

export function hashAction(actionType: string): `0x${string}` {
  return keccak256(encodePacked(['string'], [actionType]))
}

export function localMandateCheck(
  mandate: MandateData,
  actionType: string,
  estimatedValue: bigint = 0n
): LocalCheckResult {
  // Check this mandate is for THIS agent
  if (mandate.agent.toLowerCase() !== agentAccount.address.toLowerCase()) {
    return { passed: false, reason: `mandate is for agent ${mandate.agent}, not this agent ${agentAccount.address}` }
  }

  if (!mandate.active) {
    return { passed: false, reason: 'mandate revoked' }
  }

  const now = BigInt(Math.floor(Date.now() / 1000))
  if (now >= mandate.expiresAt) {
    return { passed: false, reason: 'mandate expired' }
  }

  const actionHash = hashAction(actionType)
  const allowed = mandate.allowedActions.some(a => a === actionHash)
  if (!allowed) {
    return { passed: false, reason: `action "${actionType}" not in allowedActions` }
  }

  if (mandate.maxValuePerAction > 0n && estimatedValue > mandate.maxValuePerAction) {
    return { passed: false, reason: `value ${estimatedValue} exceeds max ${mandate.maxValuePerAction}` }
  }

  return { passed: true, reason: 'all local checks passed' }
}
