import { keccak256, toHex, encodePacked } from 'viem'
import {
  publicClient,
  MANDATE_REGISTRY_ADDRESS,
  MANDATE_REGISTRY_ABI,
} from './config.js'

export interface MandateData {
  owner: `0x${string}`
  agent: `0x${string}`
  allowedActions: readonly `0x${string}`[]
  expiresAt: bigint
  maxValuePerAction: bigint
  selfProofHash: `0x${string}`
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

  const [owner, agent, allowedActions, expiresAt, maxValuePerAction, selfProofHash, active] = result
  return { owner, agent, allowedActions, expiresAt, maxValuePerAction, selfProofHash, active }
}

export function hashAction(actionType: string): `0x${string}` {
  return keccak256(encodePacked(['string'], [actionType]))
}

export function localMandateCheck(
  mandate: MandateData,
  actionType: string,
  estimatedValue: bigint = 0n
): LocalCheckResult {
  if (!mandate.active) {
    return { passed: false, reason: 'mandate revoked' }
  }

  const now = BigInt(Math.floor(Date.now() / 1000))
  if (now >= mandate.expiresAt) {
    return { passed: false, reason: 'mandate expired' }
  }

  const zeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
  if (mandate.selfProofHash === zeroHash) {
    return { passed: false, reason: 'mandate not backed by verified human' }
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
