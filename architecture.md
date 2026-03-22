# Mandate Execution Layer — Architecture

## System Overview

A primitive that lets humans define bounded authority for agents, agents execute within it, and anyone (including an AI judge) verify compliance onchain — without trusting the agent's word. Everything is on Celo Sepolia — same chain as Self Agent ID. No cross-chain oracle needed.

```
┌──────────────────────────────────────────────────────────────┐
│                    HUMAN (Mandate Creator)                    │
│  Holds Self soulbound NFT on Celo Sepolia                    │
│  Defines: allowed actions, scope, time window, value limits  │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│         PERSONHOOD LAYER (Self Protocol — Celo Sepolia)      │
│                                                              │
│  Human scans NFC passport → soulbound NFT minted on Celo    │
│  Proves: "I am a real, unique human" without revealing who   │
│  Contract enforces: selfRegistry.balanceOf(msg.sender) > 0   │
│  No NFT = createMandate() reverts. Enforcement, not storage. │
│  Package: @selfxyz/agent-sdk                                 │
│  Anti-sybil: one human = one verified mandate creator        │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              MANDATE LAYER (Onchain State)                    │
│                                                              │
│  ┌─────────────────────┐                                     │
│  │ MandateRegistry.sol │                                     │
│  │ (Celo Sepolia)      │                                     │
│  │ Live Self check     │                                     │
│  │ No selfProofHash    │                                     │
│  └─────────┬───────────┘                                     │
│            │                                                  │
│  createMandate() enforces selfRegistry.balanceOf() > 0       │
│  isHumanBacked() is live check, not hash comparison          │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              IDENTITY LAYER (Self Agent ID)                   │
│                                                              │
│  Agent identity via Self Agent ID #34                        │
│  Registered via @selfxyz/agent-sdk (linked mode)             │
│  Agent address: 0x63673a506B04454D720dc891862a348Df97Ae7bA   │
│  Self Agent ID Registry: 0x043DaCac8b0771DD5b444bCC88f2f8BB  │
│  Agent checks: mandate.agent == agentAddress                 │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              REASONING LAYER (Venice AI)                      │
│                                                              │
│  Before every action:                                        │
│  Agent sends { mandate, proposedAction } → Venice            │
│  Venice reasons on ALL actions (compliant AND blocked)        │
│  Returns { compliant: bool, reason, confidence }             │
│  No data retention — mandate contents stay private           │
│  Only hash of reasoning goes onchain                         │
│                                                              │
│  API: https://api.venice.ai/api/v1 (OpenAI-compatible)      │
└──────────────┬──────────────────────┬────────────────────────┘
               │                      │
          compliant              not compliant
               │                      │
               ▼                      ▼
┌──────────────────────┐  ┌────────────────────────┐
│  EXECUTE ACTION      │  │  BLOCK + LOG REJECTION │
│  Real onchain tx     │  │  Append to agent_log   │
└──────────┬───────────┘  └──────────┬─────────────┘
           │                         │
           └────────────┬────────────┘
                        ▼
┌──────────────────────────────────────────────────────────────┐
│              RECEIPT LAYER (Onchain Proof)                    │
│                                                              │
│  ActionReceipt.sol stores (for ALL actions):                 │
│  - mandateId                                                 │
│  - actionHash (keccak256 of action type + params)            │
│  - reasoningHash (keccak256 of Venice reasoning)             │
│  - compliant (true = executed, false = blocked)              │
│  - timestamp                                                 │
│  - agentSignature (EIP-712 typed)                            │
│                                                              │
│  Trust chain: receipt → mandate → Self Agent ID NFT → human  │
│  Queryable by anyone. AI judge can verify programmatically.  │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Smart Contracts (Solidity — Celo Sepolia)

#### `MandateRegistry.sol`

Stores mandates created by humans. Each mandate defines what an agent is allowed to do. The contract enforces Self Protocol verification at creation time — `selfRegistry.balanceOf(msg.sender) > 0` must be true or the transaction reverts.

```solidity
struct Mandate {
    address owner;              // human who created the mandate
    address agent;              // agent address (Self Agent ID #34)
    bytes32[] allowedActions;   // keccak256 hashes of allowed action type strings
    uint256 expiresAt;          // unix timestamp
    uint256 maxValuePerAction;  // wei
    bool active;                // can be revoked by owner
}
// No selfProofHash — verification is live via selfRegistry.balanceOf()

// State
mapping(uint256 => Mandate) public mandates;
uint256 public nextMandateId;

// Write
function createMandate(address agent, bytes32[] calldata allowedActions, uint256 expiresAt, uint256 maxValuePerAction) external returns (uint256 mandateId);
// Reverts if selfRegistry.balanceOf(msg.sender) == 0

function isHumanBacked(uint256 mandateId) external view returns (bool);
// Live check: selfRegistry.balanceOf(mandate.owner) > 0

function revokeMandate(uint256 mandateId) external; // owner only

// Read
function getMandate(uint256 mandateId) external view returns (Mandate memory);
function isActionAllowed(uint256 mandateId, bytes32 actionHash) external view returns (bool);
function isMandateActive(uint256 mandateId) external view returns (bool);

// Events
event MandateCreated(uint256 indexed mandateId, address indexed owner, address indexed agent);
event MandateRevoked(uint256 indexed mandateId);
```

#### `ActionReceipt.sol`

Immutable proof of every action the agent takes (or blocks).

```solidity
struct Receipt {
    uint256 mandateId;
    bytes32 actionHash;         // keccak256(actionType + params)
    bytes32 reasoningHash;      // keccak256(Venice reasoning) — privacy-preserving
    bool compliant;             // true = executed, false = blocked
    uint256 timestamp;
    bytes agentSignature;       // EIP-712 typed signature
}

// State
mapping(uint256 => Receipt[]) public receiptsByMandate;

// Write
function postReceipt(uint256 mandateId, bytes32 actionHash, bytes32 reasoningHash, bool compliant, bytes calldata agentSignature) external;

// Read
function getReceipts(uint256 mandateId) external view returns (Receipt[] memory);
function getReceiptCount(uint256 mandateId) external view returns (uint256);

// Events
event ActionExecuted(uint256 indexed mandateId, bytes32 actionHash, bool compliant);
```

---

### 2. Self Protocol — Agent Identity + Personhood (Root of Trust)

**Package:** `@selfxyz/agent-sdk`

**Agent Identity:**
- Self Agent ID #34, registered via linked mode
- Agent address: `0x63673a506B04454D720dc891862a348Df97Ae7bA`
- Self Agent ID Registry: `0x043DaCac8b0771DD5b444bCC88f2f8BBDBEdd379`
- All on Celo Sepolia — same chain as contracts

**Personhood Verification:**
- Human holds Self soulbound NFT on Celo Sepolia
- MandateRegistry contract calls `selfRegistry.balanceOf(msg.sender)` at mandate creation
- No NFT = transaction reverts — this is enforcement, not storage
- `isHumanBacked()` is a live onchain check: `selfRegistry.balanceOf(mandate.owner) > 0`
- No `selfProofHash` stored — verification is always current

**How It Works:**
1. Human scans NFC chip in passport via Self mobile app
2. ZK proof generated + soulbound NFT minted on Celo Sepolia
3. When human calls `createMandate()`, contract checks NFT ownership
4. No NFT = revert. NFT present = mandate created.
5. `isHumanBacked()` checks live — if human loses NFT, mandate is no longer human-backed

**Trust Chain:**
```
Self soulbound NFT → contract enforces balanceOf > 0 → mandate created
→ receipt references mandate → full chain: receipt → mandate → Self NFT → verified human
```

---

### 3. Venice AI — Private Reasoning

**API:** `https://api.venice.ai/api/v1` (OpenAI-compatible)
**Auth:** Bearer token from `venice.ai/settings/api`
**No data retention** — mandate contents stay private

**Models:** `llama-3.3-70b`, `qwen3-235b`, or any available model

**Venice reasons on ALL actions** — not just compliant ones. Every action, whether it will be executed or blocked, goes through Venice for semantic reasoning. The reasoning hash is posted onchain for every action.

**Compliance Check Prompt:**
```typescript
const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${VENICE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b',
    messages: [
      {
        role: 'system',
        content: `You are a mandate compliance engine. Given a mandate definition and a proposed action, determine compliance. Return ONLY valid JSON: { "compliant": boolean, "reason": "string", "confidence": number }`
      },
      {
        role: 'user',
        content: JSON.stringify({
          mandate: { allowedActions, expiresAt, maxValuePerAction },
          proposedAction: { type, params, estimatedValue }
        })
      }
    ]
  })
})
```

---

### 4. Agent Core Loop (TypeScript)

```
receive action request
  → fetch mandate from MandateRegistry contract
  → verify mandate.agent == agentAddress (agent checks it's for itself)
  → verify isHumanBacked (live selfRegistry.balanceOf check)
  → local checks (expiry, action type hash, value limits)
  → Venice private compliance check (reasons on ALL actions)
  → if compliant: execute action
  → if not compliant: block action
  → post ActionReceipt onchain (for every action — compliant or blocked)
  → append to agent_log.json
  → return result
```

**Key Libraries:**
- `viem` — onchain interactions (read/write contracts)
- `@selfxyz/agent-sdk` — Self Agent ID registration + verification
- OpenAI-compatible client or raw fetch — Venice API
- `viem` — wallet management, signing

---

### 5. Execution Logs

**`agent_log.json`** — structured trace of every decision:

```json
{
  "logs": [
    {
      "timestamp": "2026-03-20T10:00:00Z",
      "mandateId": 1,
      "proposedAction": {
        "type": "send_message",
        "params": { "to": "user@example.com", "subject": "Report" }
      },
      "agentCheck": "mandate.agent == agentAddress: true",
      "humanBacked": "selfRegistry.balanceOf(owner) > 0: true",
      "localCheck": "passed",
      "veniceDecision": {
        "compliant": true,
        "reason": "send_message is in allowedActions, value is 0, within time window",
        "confidence": 0.98
      },
      "executed": true,
      "receiptTxHash": "0xda7b8c51...",
      "blockNumber": 12345678
    },
    {
      "timestamp": "2026-03-20T10:05:00Z",
      "mandateId": 1,
      "proposedAction": {
        "type": "transfer_funds",
        "params": { "to": "0x...", "amount": "1000000000000000000" }
      },
      "agentCheck": "mandate.agent == agentAddress: true",
      "humanBacked": "selfRegistry.balanceOf(owner) > 0: true",
      "localCheck": "failed — action not in allowedActions",
      "veniceDecision": {
        "compliant": false,
        "reason": "transfer_funds is not in the mandate's allowedActions list",
        "confidence": 0.99
      },
      "executed": false,
      "receiptTxHash": "0xd41cb233...",
      "blockNumber": 12345680
    }
  ]
}
```

---

## Network & Chain

- **All contracts:** Celo Sepolia (44787)
- **Self Agent ID:** Celo Sepolia (same chain)
- **Self soulbound NFT:** Celo Sepolia (same chain)
- **No cross-chain oracle needed** — everything is on one chain
- **Contracts verified on Blockscout**

---

## Deployed Contracts

| Contract | Address |
|---|---|
| MandateRegistry | `0x25dd80A4E8193a1369763991EB03ce378C09EEBE` |
| ActionReceipt | `0x58BF38bAd9F33A5C3892870af8B35964E55e3E53` |
| Self Agent ID Registry | `0x043DaCac8b0771DD5b444bCC88f2f8BBDBEdd379` |

## Addresses

| Role | Address |
|---|---|
| Human (mandate creator) | `0xf282FCCc0608147aB493e6a081d354646614b4F1` |
| Agent (Self Agent ID #34) | `0x63673a506B04454D720dc891862a348Df97Ae7bA` |

---

## Directory Structure

```
mandate-execution-layer/
├── contracts/
│   ├── src/
│   │   ├── MandateRegistry.sol
│   │   └── ActionReceipt.sol
│   ├── test/
│   │   ├── MandateRegistry.t.sol
│   │   └── ActionReceipt.t.sol
│   ├── script/
│   │   └── Deploy.s.sol
│   └── foundry.toml
├── agent/
│   ├── src/
│   │   ├── index.ts              # entry point
│   │   ├── mandate.ts            # mandate fetching + local checks
│   │   ├── venice.ts             # Venice compliance checker (all actions)
│   │   ├── executor.ts           # action execution
│   │   ├── receipt.ts            # onchain receipt posting
│   │   ├── self.ts               # Self Protocol verification
│   │   ├── logger.ts             # agent_log.json writer
│   │   └── config.ts             # env, addresses, ABIs
│   ├── agent.json                # agent manifest
│   ├── agent_log.json            # execution trace
│   ├── package.json
│   └── tsconfig.json
├── architecture.md
├── processflow.md
├── plan.md
└── README.md
```
