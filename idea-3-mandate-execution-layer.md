# Mandate Execution Layer

## Concept

A primitive that lets humans define bounded authority, agents execute within it, and anyone verify compliance — without trusting the agent's word.

The real primitive is not being verified, but a **verified agent acting within a bounded mandate**.

## The Problem

Personhood verification is layer 1 — already partially solved. The missing layer is **action legitimacy**: proving that a verified agent acted within the scope its human authorized, at the action level, with onchain proof.

## How It Works

```
human proves identity via Self Protocol (passport scan → soulbound NFT)
  → contract enforces: selfRegistry.balanceOf(msg.sender) > 0
  → human defines mandate (allowed actions, scope, time window)
  → mandate encoded onchain — no NFT = tx reverts
  → agent identity registered via Self Agent ID (linked mode)
  → agent checks mandate is addressed to itself
  → before every action: Venice privately reasons on compliance (ALL actions)
  → if compliant: execute + post onchain receipt
  → if out-of-mandate: block + post onchain receipt
  → anyone can verify: receipt → mandate → Self Agent ID NFT → verified human
```

## Architecture

### Five Layers

```
┌──────────────────────────────────────────────────────────────┐
│  PERSONHOOD LAYER → Self Agent ID (soulbound NFT, Celo)      │
│  MANDATE LAYER    → MandateRegistry.sol (live Self check)    │
│  IDENTITY LAYER   → Self Agent ID #34 (linked mode)          │
│  REASONING LAYER  → Venice AI (private, reasons on ALL)      │
│  RECEIPT LAYER    → ActionReceipt.sol                        │
└──────────────────────────────────────────────────────────────┘
```

---

### Self Protocol — Root of Trust (Real Integration)

Human scans passport via Self app → ZK proof → soulbound NFT minted on Celo Sepolia. Agent registered via `@selfxyz/agent-sdk` in linked mode — agent gets its own keypair, human's passport backs it.

**Contract enforcement:**
```solidity
function createMandate(...) external returns (uint256 mandateId) {
    require(
        selfRegistry.balanceOf(msg.sender) > 0,
        "caller has no Self Agent ID"
    );
    // only verified humans reach here
}

function isHumanBacked(uint256 mandateId) external view returns (bool) {
    return selfRegistry.balanceOf(mandates[mandateId].owner) > 0;
    // LIVE check — if NFT is burned, returns false
}
```

Without Self: anyone creates mandates. Bot farms flood the system.
With Self: **only passport-verified humans create mandates. Contract enforces it.**

**Agent registration:**
```typescript
import { requestRegistration } from '@selfxyz/agent-sdk'

const session = await requestRegistration({
  mode: 'linked',
  network: 'testnet',
  humanAddress: '0xf282...',
  disclosures: { minimumAge: 18 },
  agentName: 'MandateAgent',
})
// Human scans QR → agent gets Self Agent ID #34
// Agent private key exported, used for all operations
```

---

### Smart Contracts (Celo Sepolia)

**`MandateRegistry.sol`** — deployed at `0x25dd80A4E8193a1369763991EB03ce378C09EEBE`

```solidity
struct Mandate {
    address owner;              // human (must hold Self NFT)
    address agent;              // Self Agent ID agent address
    bytes32[] allowedActions;   // keccak256 of action type strings
    uint256 expiresAt;
    uint256 maxValuePerAction;
    bool active;
}
// No selfProofHash — verification is live via selfRegistry.balanceOf()
```

Key functions:
- `createMandate()` — reverts if caller has no Self Agent ID NFT
- `isHumanBacked()` — live onchain check against Self registry
- `isActionAllowed()` — check action hash against mandate
- `isMandateActive()` — check expiry + active flag
- `revokeMandate()` — human can kill the mandate anytime

**`ActionReceipt.sol`** — deployed at `0x58BF38bAd9F33A5C3892870af8B35964E55e3E53`

```solidity
struct Receipt {
    uint256 mandateId;
    bytes32 actionHash;      // keccak256(actionType)
    bytes32 reasoningHash;   // hash of Venice reasoning (privacy-preserving)
    bool compliant;          // true = executed, false = blocked
    uint256 timestamp;
    bytes agentSignature;
}
```

---

### Venice — Private Mandate Reasoning (ALL Actions)

Venice reasons on **every action** — compliant and blocked. Not just a filter.

```typescript
const decision = await veniceClient.chat.completions.create({
  model: "llama-3.3-70b",
  messages: [
    {
      role: "system",
      content: `You are a mandate compliance engine.
      You are the final authority on whether an action should be executed.
      Return ONLY valid JSON: { compliant: bool, reason: string, confidence: float }`
    },
    {
      role: "user",
      content: JSON.stringify({
        mandate: { allowedActionNames, expiresAt, maxValuePerAction, isHumanBacked },
        proposedAction,
        localCheckResult
      })
    }
  ]
})
```

Venice has no data retention — mandate contents stay private. Only the **hash** of the reasoning goes onchain.

---

### Agent Core Loop

```typescript
async function executeWithMandate(mandateId, proposedAction) {
  // 1. verify delegation
  const delegationCheck = verifyDelegation(agentAccount.address)

  // 2. fetch mandate from chain
  const mandate = await fetchMandate(mandateId)
  const humanBacked = await isHumanBacked(mandateId) // live Self check

  // 3. local checks
  // - mandate.agent == agentAddress (is this mandate for ME?)
  // - mandate is active and not expired
  // - action type is in allowedActions

  // 4. Venice reasons on EVERY action (compliant or not)
  const veniceDecision = await checkCompliance(mandate, proposedAction)

  // 5. execute or block based on Venice decision
  if (veniceDecision.compliant) {
    await executeAction(proposedAction)
  }

  // 6. post onchain receipt (always — both compliant and blocked)
  await postReceipt(mandateId, actionHash, reasoningHash, veniceDecision.compliant)

  // 7. log to agent_log.json
  appendLog({ mandateId, action, veniceDecision, txHash })
}
```

---

## Demo Results

| # | Action | Context | Result |
|---|---|---|---|
| 1 | `send_message` | In mandate | EXECUTED |
| 2 | `transfer_funds` | Not in allowed actions | BLOCKED |
| 3 | `query_api` | In mandate | EXECUTED |
| 4 | `admin_override` | Not in allowed actions | BLOCKED |
| 5 | `send_message` | After revocation | BLOCKED |

5 onchain receipts + mandate creation + revocation = **7 total onchain transactions** on Celo Sepolia.

---

## Deployed Infrastructure

| Component | Address / ID |
|---|---|
| MandateRegistry | `0x25dd80A4E8193a1369763991EB03ce378C09EEBE` |
| ActionReceipt | `0x58BF38bAd9F33A5C3892870af8B35964E55e3E53` |
| Self Agent ID Registry | `0x043DaCac8b0771DD5b444bCC88f2f8BBDBEdd379` |
| Agent (Self Agent ID #34) | `0x63673a506B04454D720dc891862a348Df97Ae7bA` |
| Human | `0xf282FCCc0608147aB493e6a081d354646614b4F1` |
| Chain | Celo Sepolia (11142220) |
| Contracts verified | Blockscout |

---

## Target Bounties

| Bounty | Reason | Prize |
|---|---|---|
| Protocol Labs — Let the Agent Cook | Full autonomous loop, structured logs, real onchain artifacts | $8,000 |
| Protocol Labs — Agents With Receipts | Onchain proof, trust infrastructure, agent identity | $8,004 |
| Venice | Private mandate reasoning on ALL actions, no data retention | $11,500 |
| Self | Real Self Agent ID integration — contract enforces NFT, agent registered via SDK | $1,000 |

**Total potential: ~$28,500**

## Tech Stack

- TypeScript / Node.js
- Solidity + Foundry
- Viem for onchain interactions
- Venice API (OpenAI-compatible, no data retention)
- Self Protocol (`@selfxyz/agent-sdk`, Self Agent ID #34)
- Celo Sepolia (all contracts + Self registry on same chain)

## Why This Wins

- It's a **primitive**, not an app — judges who understand protocol design will recognize this
- **Five layers, each load-bearing** — remove any layer and the primitive breaks
- Self Protocol is **enforced at the contract level** — not a stored hash, not simulated
- Venice reasons on **ALL actions** — the reasoning hash onchain proves it
- Agent identity comes from Self Agent ID — **real registration, real keypair**
- Everything on **one chain** — no cross-chain oracle, no trust assumptions
- Real onchain artifacts: 7 transactions, verified contracts, queryable receipts
- The AI judge can trace the full chain programmatically: receipt → mandate → Self NFT → verified human
