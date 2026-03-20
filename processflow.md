# Mandate Execution Layer — Process Flow

## The Problem

An AI agent acts on your behalf. But how does anyone know it only did what you authorized? There's no onchain proof of **bounded authority**.

## The 5-Layer Flow

```
HUMAN                                          ONCHAIN
  │                                              │
  │  1. PERSONHOOD (Self Protocol)               │
  │  ─────────────────────────────               │
  │  Scan NFC passport with Self app             │
  │  ZK proof generated → proves "I'm human"     │
  │  No identity revealed, just proof             │
  │  selfProofHash = keccak256(proof)             │
  │                                              │
  │  2. DELEGATION (MetaMask ERC-7715)           │
  │  ─────────────────────────────               │
  │  Human creates delegation to agent           │
  │  Caveats = restrictions:                     │
  │    - Which contracts agent can call           │
  │    - Which functions allowed                  │
  │  This is the cryptographic root of authority  │
  │                                              │
  │  3. MANDATE (MandateRegistry.sol)            │
  │  ─────────────────────────────               │
  │  Human calls createMandate() onchain:     ──→│ Stored onchain
  │    - agent address                           │   ├─ allowedActions[]
  │    - allowed actions (hashed)                │   ├─ expiresAt
  │    - expiry time                             │   ├─ maxValuePerAction
  │    - max value per action                    │   ├─ selfProofHash
  │    - selfProofHash                           │   └─ active: true
  │                                              │
  │  Now the agent has bounded authority.         │
  │                                              │
  ▼                                              │
AGENT                                            │
  │                                              │
  │  4. REASONING (Venice AI)                    │
  │  ─────────────────────────                   │
  │  Agent receives action request:              │
  │    "send_message to user@example.com"        │
  │                                              │
  │  Step A: Check delegation                    │
  │    → Am I the authorized delegate? ✓         │
  │                                              │
  │  Step B: Fetch mandate from chain            │
  │    → Is it active? ✓                         │
  │    → Is it expired? ✗                        │
  │    → Is it human-backed (selfProofHash)? ✓   │
  │    → Is action in allowedActions? ✓          │
  │    → Is value within limit? ✓                │
  │                                              │
  │  Step C: Venice private compliance check     │
  │    → Send {mandate, action} to Venice AI     │
  │    → Venice reasons privately (no retention)  │
  │    → Returns {compliant: true, reason, 0.95} │
  │    → Only hash of reasoning goes onchain      │
  │                                              │
  │  Step D: Execute action                      │
  │    → Action is within bounds → execute        │
  │                                              │
  │  5. RECEIPT (ActionReceipt.sol)              │
  │  ─────────────────────────                   │
  │  Agent posts receipt onchain:             ──→│ Stored onchain
  │    - mandateId                               │   ├─ actionHash
  │    - actionHash                              │   ├─ reasoningHash
  │    - reasoningHash (Venice, privacy)         │   ├─ compliant: true
  │    - compliant: true                         │   ├─ timestamp
  │    - agent signature                         │   └─ agentSignature
  │                                              │
  │  Log to agent_log.json                       │
  │                                              │
  ▼                                              ▼
ANYONE (including AI judge)
  │
  │  Can verify the FULL trust chain:
  │
  │  1. Query ActionReceipt.getReceipts(mandateId)
  │     → See every action: what happened, was it compliant?
  │
  │  2. Query MandateRegistry.getMandate(mandateId)
  │     → See what was allowed, who authorized it
  │
  │  3. Query MandateRegistry.isHumanBacked(mandateId)
  │     → selfProofHash ≠ 0 → real human behind this
  │
  │  4. Trace: receipt → mandate → Self proof → verified human
  │
  │  No trust in the agent required. Everything is verifiable.
```

---

## Out-of-Mandate Action Flow

```
Agent receives "transfer_funds"
  → Delegation check: valid ✓
  → Fetch mandate from chain
  → Local check: "transfer_funds" NOT in allowedActions ✗
  → BLOCKED — action never executes
  → Receipt posted onchain: compliant: false
  → Logged in agent_log.json
  → Anyone can see it was correctly blocked
```

---

## Mandate Revocation Flow

```
Human calls revokeMandate(mandateId)
  → mandate.active = false onchain

Agent receives "send_message" (was previously allowed)
  → Delegation check: valid ✓
  → Fetch mandate from chain
  → Local check: mandate revoked ✗
  → BLOCKED — even though action type was allowed
  → Receipt posted onchain: compliant: false
  → Human retains kill switch at all times
```

---

## Demo Results — All 5 Scenarios Verified

| # | Action | Context | Result | Onchain Receipt |
|---|---|---|---|---|
| 1 | `send_message` | In mandate | EXECUTED | compliant: true |
| 2 | `transfer_funds` | Not in allowed list | BLOCKED | compliant: false |
| 3 | `query_api` | In mandate | EXECUTED | compliant: true |
| 4 | `admin_override` | Not in allowed list | BLOCKED | compliant: false |
| 5 | `send_message` | After revocation | BLOCKED | compliant: false |

All 5 have real onchain receipts on Base Sepolia. 7 total onchain transactions.

---

## Why Each Layer Is Load-Bearing

| Layer | What Breaks Without It |
|---|---|
| **Self Protocol** | Anyone can create mandates — bot farms flood the system |
| **MetaMask Delegation** | No cryptographic proof the human authorized this agent |
| **MandateRegistry** | No queryable onchain state of what's allowed |
| **Venice AI** | Compliance checking is public — mandate contents are exposed |
| **ActionReceipt** | No proof the agent actually followed the rules |

Remove any layer and the primitive breaks.

---

## Trust Chain

```
ActionReceipt (onchain proof)
  │
  ├── references mandateId
  │
  ▼
MandateRegistry (onchain state)
  │
  ├── contains selfProofHash
  ├── contains allowedActions
  ├── contains agent address
  │
  ▼
Self Protocol (ZK proof)
  │
  ├── proves humanity
  ├── proves uniqueness
  ├── no identity revealed
  │
  ▼
Verified Human
```

**receipt → mandate → Self proof → verified human**

---

## Deployed Contracts (Base Sepolia)

| Contract | Address | Verified |
|---|---|---|
| MandateRegistry | `0xA0F8E21B7DeafB489563B5428e42d26745c9EA52` | ✓ |
| ActionReceipt | `0xEcAe9d43d49d02D1ED926A7Dce25e85a9B047a43` | ✓ |

## Addresses

| Role | Address |
|---|---|
| Human (mandate creator) | `0xf282FCCc0608147aB493e6a081d354646614b4F1` |
| Agent (executor) | `0x2d8E271E22A26508817561f12eff0874dD0aA6DA` |

## Key Transaction Hashes

| Action | Tx Hash |
|---|---|
| Mandate creation | `0x091d60b092359cea463cbb285c62a59747622cbacb341bcc5f88b75a892699e7` |
| send_message (executed) | `0x9983b5bb9ca9af586a981e88a5b0771330d5d0801100e72b792ca80fc4e5ba4c` |
| transfer_funds (blocked) | `0x4d57c4258bd320f6185e953bac13b326c7e8913ee67aad5657f22a7dbaf67bca` |
| query_api (executed) | `0x44a57767b58398a7747aa08929d6bf7091d80a4b4094bcb0741db9d621f52ac3` |
| admin_override (blocked) | `0xebf8e0ec90370bb1c9d87bfd3b82131ba5066be070d53410087665f0de38b925` |
| Mandate revocation | `0x89444bf0e06a5338263a2bce2b63f1279a65b3a3a5b3c65ec0adf2537f7e6d49` |
| send_message post-revoke (blocked) | `0x4870e823bc6ae3f609acbab22fc55baf2eb73e859732107ba33b8b73931a7718` |
