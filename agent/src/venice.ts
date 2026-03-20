import { keccak256, encodePacked } from 'viem'
import { VENICE_API_KEY } from './config.js'

export interface ComplianceDecision {
  compliant: boolean
  reason: string
  confidence: number
}

// Local fallback when Venice API is unavailable
function localComplianceCheck(
  mandate: {
    allowedActions: string[]
    expiresAt: bigint
    maxValuePerAction: bigint
    selfProofHash: string
  },
  proposedAction: {
    type: string
    params: Record<string, unknown>
    estimatedValue?: number
  }
): ComplianceDecision {
  const zeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
  if (mandate.selfProofHash === zeroHash) {
    return { compliant: false, reason: 'mandate not human-backed', confidence: 1.0 }
  }

  const now = BigInt(Math.floor(Date.now() / 1000))
  if (now >= mandate.expiresAt) {
    return { compliant: false, reason: 'mandate expired', confidence: 1.0 }
  }

  const actionHash = keccak256(encodePacked(['string'], [proposedAction.type]))
  const allowed = mandate.allowedActions.some(a => a.toLowerCase() === actionHash.toLowerCase())
  if (!allowed) {
    return { compliant: false, reason: `action "${proposedAction.type}" not in allowed actions`, confidence: 1.0 }
  }

  const value = BigInt(proposedAction.estimatedValue || 0)
  if (mandate.maxValuePerAction > 0n && value > mandate.maxValuePerAction) {
    return { compliant: false, reason: `value exceeds limit`, confidence: 1.0 }
  }

  return { compliant: true, reason: `action "${proposedAction.type}" is within mandate bounds`, confidence: 0.95 }
}

export async function checkCompliance(
  mandate: {
    allowedActions: string[]
    allowedActionNames?: string[]
    expiresAt: bigint
    maxValuePerAction: bigint
    selfProofHash: string
    localCheckResult?: { passed: boolean; reason: string }
  },
  proposedAction: {
    type: string
    params: Record<string, unknown>
    estimatedValue?: number
  }
): Promise<ComplianceDecision> {
  // Try Venice first, fall back to local
  try {
    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages: [
          {
            role: 'system',
            content: `You are a mandate compliance engine. You are the final authority on whether an action should be executed.

Given a mandate definition and a proposed action, determine if the action is within the mandate's bounds.

Rules:
- The action type must be in the mandate's allowed actions list (check allowedActionNames)
- The estimated value must not exceed maxValuePerAction (in wei, 1 ETH = 1000000000000000000 wei)
- The mandate must not be expired (compare currentTimestamp against expiresAt)
- The mandate must be human-backed (isHumanBacked must be true)
- A localCheckResult may be provided — this is an advisory pre-check. Consider it but make your own independent assessment.
- If the mandate is revoked or expired (localCheckResult says so), you should agree it is non-compliant.

Return ONLY valid JSON with no extra text: { "compliant": boolean, "reason": "string", "confidence": number }
confidence should be 0.0 to 1.0.`,
          },
          {
            role: 'user',
            content: JSON.stringify({
              mandate: {
                allowedActionNames: mandate.allowedActionNames || [],
                allowedActionHashes: mandate.allowedActions,
                expiresAt: mandate.expiresAt.toString(),
                maxValuePerAction: mandate.maxValuePerAction.toString(),
                isHumanBacked: mandate.selfProofHash !== '0x0000000000000000000000000000000000000000000000000000000000000000',
              },
              proposedAction,
              currentTimestamp: Math.floor(Date.now() / 1000),
              localCheckResult: mandate.localCheckResult || null,
            }),
          },
        ],
      }),
    })

    if (!response.ok) {
      console.log(`  [Venice unavailable (${response.status}), using local compliance engine]`)
      return localComplianceCheck(mandate, proposedAction)
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()

    let jsonStr = content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) jsonStr = jsonMatch[0]

    return JSON.parse(jsonStr) as ComplianceDecision
  } catch (err) {
    console.log(`  [Venice error: ${err instanceof Error ? err.message : err}, using local compliance engine]`)
    return localComplianceCheck(mandate, proposedAction)
  }
}
