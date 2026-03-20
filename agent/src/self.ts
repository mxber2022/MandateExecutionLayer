import { keccak256, encodePacked } from 'viem'

/**
 * Self Protocol integration for ZK passport verification.
 *
 * Production flow:
 * 1. Human scans NFC passport via Self mobile app
 * 2. ZK proof generated — proves humanity without revealing identity
 * 3. Proof sent to backend verifier
 * 4. Proof hash stored in MandateRegistry alongside mandate
 *
 * For the hackathon demo, we simulate the verification and generate
 * a deterministic selfProofHash. When Self SDK is available with credits,
 * swap in the real SelfBackendVerifier.
 */

export interface SelfVerificationResult {
  valid: boolean
  selfProofHash: `0x${string}` | null
  provider: 'self-protocol' | 'self-protocol-simulated'
}

// Simulated verification for demo — generates deterministic proof hash
export async function verifySelfProof(userId: string): Promise<SelfVerificationResult> {
  // In production:
  // const verifier = new SelfBackendVerifier({
  //   scope: 'mandate-execution-layer',
  //   endpoint: 'https://your-api.com/api/verify-self',
  //   minimumAge: 18,
  //   enableOfac: true
  // })
  // const result = await verifier.verify(proof, publicSignals)

  console.log(`  [Self Protocol] Verifying identity for ${userId}`)
  console.log('  [Self Protocol] ZK passport proof validated (simulated)')

  const selfProofHash = keccak256(
    encodePacked(['string', 'string'], ['self_zk_proof_', userId])
  )

  return {
    valid: true,
    selfProofHash,
    provider: 'self-protocol-simulated',
  }
}

// Real Self Protocol integration (uncomment when SDK is ready)
/*
import { SelfBackendVerifier } from '@selfxyz/core'

const verifier = new SelfBackendVerifier({
  scope: 'mandate-execution-layer',
  endpoint: process.env.SELF_VERIFY_ENDPOINT || 'http://localhost:3000/api/verify-self',
  minimumAge: 18,
  enableOfac: true,
})

export async function verifySelfProofReal(
  proof: unknown,
  publicSignals: unknown
): Promise<SelfVerificationResult> {
  const result = await verifier.verify(proof, publicSignals)
  if (result.valid) {
    const selfProofHash = keccak256(
      encodePacked(['bytes'], [proof as `0x${string}`])
    )
    return { valid: true, selfProofHash, provider: 'self-protocol' }
  }
  return { valid: false, selfProofHash: null, provider: 'self-protocol' }
}
*/
