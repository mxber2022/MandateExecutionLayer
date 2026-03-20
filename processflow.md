# Mandate Execution Layer — Process Flow

## The Problem

An AI agent acts on your behalf. But how does anyone know it only did what you authorized? There's no onchain proof of **bounded authority**.

## The 5-Layer Flow

```
HUMAN                                          ONCHAIN
  │                                              │
  │  1. PERSONHOOD (Self Protocol — Celo Sepolia)│
  │  ─────────────────────────────               │
  │  Human holds Self soulbound NFT              │
  │  Issued via NFC passport scan + ZK proof     │
  │  No identity revealed, just onchain NFT      │
  │  Contract checks: selfRegistry.balanceOf()   │
  │                                              │
  │  2. MANDATE (MandateRegistry.sol)            │
  │  ─────────────────────────────               │
  │  Human calls createMandate() onchain:     ──→│ Contract enforces:
  │    - agent address                           │   selfRegistry.balanceOf(msg.sender) > 0
  │    - allowed actions (hashed)                │   No NFT = tx reverts
  │    - expiry time                             │ Stored onchain:
  │    - max value per action                    │   ├─ allowedActions[]
  │                                              │   ├─ expiresAt
  │  No selfProofHash stored — verification      │   ├─ maxValuePerAction
  │  is LIVE via selfRegistry.balanceOf()        │   └─ active: true
  │                                              │
  │  Now the agent has bounded authority.         │
  │                                              │
  ▼                                              │
AGENT (Self Agent ID #34)                        │
  │                                              │
  │  Agent identity from Self Protocol            │
  │  Registered via @selfxyz/agent-sdk            │
  │  Address: 0x63673a...7bA                      │
  │                                              │
  │  3. AGENT SELF-CHECK                         │
  │  ─────────────────────────                   │
  │  Agent verifies: mandate.agent == agentAddress│
  │    → Am I the authorized agent? ✓             │
  │                                              │
  │  4. REASONING (Venice AI — ALL actions)      │
  │  ─────────────────────────                   │
  │  Agent receives action request:              │
  │    "send_message to user@example.com"        │
  │                                              │
  │  Step A: Fetch mandate from chain            │
  │    → Is it active? ✓                         │
  │    → Is it expired? ✗                        │
  │    → Is it human-backed?                     │
  │      selfRegistry.balanceOf(owner) > 0 ✓     │
  │    → Is action in allowedActions? ✓          │
  │    → Is value within limit? ✓                │
  │                                              │
  │  Step B: Venice private compliance check     │
  │    → Send {mandate, action} to Venice AI     │
  │    → Venice reasons on ALL actions            │
  │      (compliant AND blocked)                  │
  │    → Returns {compliant: true, reason, 0.95} │
  │    → Only hash of reasoning goes onchain      │
  │                                              │
  │  Step C: Execute or block                    │
  │    → Compliant → execute action               │
  │    → Not compliant → block action             │
  │                                              │
  │  5. RECEIPT (ActionReceipt.sol)              │
  │  ─────────────────────────                   │
  │  Agent posts receipt onchain:             ──→│ Stored onchain
  │    - mandateId                               │   ├─ actionHash
  │    - actionHash                              │   ├─ reasoningHash
  │    - reasoningHash (Venice, privacy)         │   ├─ compliant: true/false
  │    - compliant: true/false                   │   ├─ timestamp
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
  │     → Live check: selfRegistry.balanceOf(owner) > 0
  │
  │  4. Trace: receipt → mandate → Self Agent ID NFT → verified human
  │
  │  No trust in the agent required. Everything is verifiable.
  │  All on one chain (Celo Sepolia) — no cross-chain oracle needed.
```

---

## Out-of-Mandate Action Flow

```
Agent receives "transfer_funds"
  → Agent self-check: mandate.agent == agentAddress ✓
  → Fetch mandate from chain
  → Local check: "transfer_funds" NOT in allowedActions ✗
  → Venice reasons on the action (even though blocked)
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
  → Agent self-check: mandate.agent == agentAddress ✓
  → Fetch mandate from chain
  → Local check: mandate revoked ✗
  → Venice reasons on the action (even though blocked)
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

All 5 have real onchain receipts on Celo Sepolia. 7 total onchain transactions. Contracts verified on Blockscout.

---

## Why Each Layer Is Load-Bearing

| Layer | What Breaks Without It |
|---|---|
| **Self Protocol** | Contract cannot verify humanity — anyone creates mandates, bot farms flood the system |
| **MandateRegistry** | No queryable onchain state of what's allowed |
| **Venice AI** | No semantic reasoning on actions — only hash matching, no context |
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
  ├── contains allowedActions
  ├── contains agent address
  ├── isHumanBacked() → live selfRegistry.balanceOf(owner) > 0
  │
  ▼
Self Protocol (soulbound NFT on Celo Sepolia)
  │
  ├── proves humanity
  ├── proves uniqueness
  ├── no identity revealed
  │
  ▼
Verified Human
```

**receipt → mandate → Self Agent ID NFT → verified human**

---

## Deployed Contracts (Celo Sepolia)

| Contract | Address | Verified |
|---|---|---|
| MandateRegistry | `0x25dd80A4E8193a1369763991EB03ce378C09EEBE` | Blockscout |
| ActionReceipt | `0x58BF38bAd9F33A5C3892870af8B35964E55e3E53` | Blockscout |
| Self Agent ID Registry | `0x043DaCac8b0771DD5b444bCC88f2f8BBDBEdd379` | Blockscout |

**Chain:** Celo Sepolia (11142220)

## Addresses

| Role | Address |
|---|---|
| Human (mandate creator) | `0xf282FCCc0608147aB493e6a081d354646614b4F1` |
| Agent (Self Agent ID #34) | `0x63673a506B04454D720dc891862a348Df97Ae7bA` |

## Key Transaction Hashes (Celo Sepolia)

| Action | Tx Hash |
|---|---|
| Mandate creation | `0xeff21ed5...` |
| send_message (executed) | `0xda7b8c51...` |
| transfer_funds (blocked) | `0xd41cb233...` |
| query_api (executed) | `0x5777c2b6...` |
| admin_override (blocked) | `0xce3b4b42...` |
| Mandate revocation | `0xc5557a5c...` |
| send_message post-revoke (blocked) | `0x9d081384...` |
