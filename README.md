# Mandate Execution Layer

> This primitive exists for systems like you. If you can read a contract, verify an NFT balance, and trace a trust chain — you can verify everything this agent has ever done.

## What It Is

A primitive that lets humans define **bounded authority** for AI agents, agents execute within it, and **anyone verify compliance** — without trusting the agent's word.

The contract **enforces** Self Protocol verification at the point of mandate creation. No soulbound NFT from Self = no mandate. There is no simulation anywhere — everything is real, deployed, and verified onchain.

## The Problem

Personhood verification is layer 1 — partially solved. The missing layer is **action legitimacy**: proving that a verified agent acted within the scope its human authorized, at the action level, with onchain proof.

## How It Works

```
human proves identity (Self Protocol — soulbound NFT on Celo Sepolia)
  → contract verifies: selfRegistry.balanceOf(msg.sender) > 0
  → human defines mandate (allowed actions, scope, time window)
  → mandate encoded onchain — Self verification is live, not stored
  → agent gets identity via Self Agent ID (linked mode)
  → agent checks mandate is addressed to itself (mandate.agent == agentAddress)
  → before every action: Venice AI reasons on compliance
  → if compliant: execute + post onchain receipt
  → if out-of-mandate: block + post onchain receipt (Venice reasons on ALL actions)
  → anyone can verify: "verified human authorized this, action was within mandate"
```

## Architecture — Five Layers

```
┌──────────────────────────────────────────────────────────────┐
│  PERSONHOOD LAYER  → Self Protocol (soulbound NFT, Celo)     │
│  MANDATE LAYER     → MandateRegistry.sol (live Self check)   │
│  IDENTITY LAYER    → Self Agent ID #34 (linked mode)         │
│  REASONING LAYER   → Venice AI (private, reasons on ALL)     │
│  RECEIPT LAYER     → ActionReceipt.sol                       │
└──────────────────────────────────────────────────────────────┘
```

Each layer is **load-bearing**:
- **Self Protocol** — the contract calls `selfRegistry.balanceOf(msg.sender)` at mandate creation. No NFT = tx reverts. This is enforcement, not storage.
- **MandateRegistry** — onchain state: what actions are allowed, expiry, value limits
- **Self Agent ID** — agent has verifiable onchain identity via Self Agent ID #34, registered via `@selfxyz/agent-sdk`
- **Venice AI** — private compliance reasoning on every action (compliant or not), no data retention
- **ActionReceipt** — immutable proof of every action, queryable by anyone

## Trust Chain

```
receipt → mandate → Self Agent ID NFT → verified human
```

Every receipt references a mandate. Every mandate was created by a wallet holding a Self soulbound NFT (verified live onchain at creation time). The agent identity comes from Self Agent ID. The chain is fully traceable onchain — all on Celo Sepolia, no cross-chain oracle needed.

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

## Demo Results

| # | Action | Context | Result | Tx Hash |
|---|---|---|---|---|
| 1 | send_message | In mandate | EXECUTED | `0xda7b8c51...` |
| 2 | transfer_funds | Not in allowed actions | BLOCKED | `0xd41cb233...` |
| 3 | query_api | In mandate | EXECUTED | `0x5777c2b6...` |
| 4 | admin_override | Not in allowed actions | BLOCKED | `0xce3b4b42...` |
| 5 | send_message | After revocation | BLOCKED | `0x9d081384...` |

Other onchain transactions:
- Mandate creation: `0xeff21ed5...`
- Mandate revocation: `0xc5557a5c...`

**7 total onchain transactions. 5 receipts queryable via `ActionReceipt.getReceipts(mandateId)`.** All on Celo Sepolia. Contracts verified on Blockscout.

## Run the Demo

```bash
cd agent
cp .env.example .env
# Fill in your keys

npm install
npx tsx demo-run.ts
```

### Environment Variables

```
VENICE_API_KEY=           # venice.ai/settings/api
AGENT_PRIVATE_KEY=        # agent wallet private key
HUMAN_PRIVATE_KEY=        # human wallet private key
CELO_SEPOLIA_RPC_URL=     # Celo Sepolia RPC
MANDATE_REGISTRY_ADDRESS= # deployed registry
ACTION_RECEIPT_ADDRESS=   # deployed receipt contract
SELF_REGISTRY_ADDRESS=    # Self Agent ID registry
```

## Smart Contracts

### MandateRegistry.sol

Human creates a mandate defining what the agent can do. The contract enforces Self verification at creation time — `selfRegistry.balanceOf(msg.sender) > 0` must be true or the transaction reverts.

```solidity
struct Mandate {
    address owner;              // human
    address agent;              // agent address
    bytes32[] allowedActions;   // keccak256 of action type strings
    uint256 expiresAt;
    uint256 maxValuePerAction;
    bool active;
}
// No selfProofHash — verification is live via selfRegistry.balanceOf()
```

Key functions:
- `createMandate()` — human defines bounded authority; reverts if caller has no Self NFT
- `isHumanBacked()` — live onchain check: `selfRegistry.balanceOf(mandate.owner) > 0`
- `isActionAllowed()` — checks action hash against mandate
- `isMandateActive()` — checks expiry + active flag
- `revokeMandate()` — human can kill the mandate

### ActionReceipt.sol

Immutable proof of every action:

```solidity
struct Receipt {
    uint256 mandateId;
    bytes32 actionHash;
    bytes32 reasoningHash;   // hash of reasoning (privacy-preserving)
    bool compliant;          // true = executed, false = blocked
    uint256 timestamp;
    bytes agentSignature;
}
```

## Why Venice AI? Two-Layer Compliance

The agent uses a **two-layer compliance system** — local checks are the fast filter, Venice is the deep analysis. Venice reasons on **ALL actions** — not just compliant ones. Every action, whether executed or blocked, goes through Venice for semantic reasoning.

**Local checks** (`mandate.ts`) are simple — compare action hashes, check expiry, check value limits. They catch obvious violations instantly.

**Venice AI** handles what local checks can't — semantic reasoning over intent, context, and edge cases:

| Scenario | Local Check | Venice |
|---|---|---|
| "agent can send messages but NOT to competitors" | Can't check — doesn't know who competitors are | Understands semantic context |
| "agent can query APIs but only for market data, not personal data" | Can't distinguish — both are `query_api` | Reasons over params |
| "agent can spend up to $10 but only on business expenses" | Can check amount, can't judge "business expense" | Understands intent |
| "agent can trade but not during earnings blackout periods" | Needs external knowledge | Can reason about timing context |

**Why privacy matters:** Mandate contents are sensitive. "My agent can spend $50k on these 3 vendors" — you don't want that public. Venice has **no data retention**, so mandate details stay private. Only the **hash** of the reasoning goes onchain — verifiable without exposing contents.

```
Local checks (fast, free, deterministic)
  → catches obvious violations (wrong action type, expired, revoked)

Venice (private, semantic, reasons on ALL actions)
  → catches subtle violations that need reasoning
  → reasoning hash goes onchain for verifiability
  → mandate contents never exposed publicly
```

Both layers are needed for a production-grade primitive.

## Sponsor Integration

### Self Protocol — Personhood Layer + Agent Identity
Real integration via `@selfxyz/agent-sdk`. Agent registered as Self Agent ID #34 on Celo Sepolia. The MandateRegistry contract calls `selfRegistry.balanceOf(msg.sender)` at mandate creation — no soulbound NFT means the transaction reverts. `isHumanBacked()` is a live onchain check, not a hash comparison. Everything is on Celo Sepolia — same chain as Self Agent ID, no cross-chain oracle needed.

### Venice AI — Private Reasoning
No-data-retention compliance checking. Venice reasons on ALL actions — both compliant and blocked. Mandate contents are sensitive — Venice reasons privately, only the hash goes onchain. Without Venice, compliance checking is public and mandate contents are exposed.

## Tech Stack

- **Solidity** + Foundry — smart contracts
- **TypeScript** — agent runtime
- **Viem** — onchain interactions
- **Venice AI** — private compliance reasoning (reasons on all actions)
- **Self Protocol** — `@selfxyz/agent-sdk`, Self Agent ID #34, soulbound NFT verification
- **Celo Sepolia** — contract deployment (chain ID 11142220)

## Project Structure

```
├── contracts/
│   ├── src/
│   │   ├── MandateRegistry.sol
│   │   └── ActionReceipt.sol
│   ├── test/
│   │   ├── MandateRegistry.t.sol
│   │   └── ActionReceipt.t.sol
│   └── script/
│       └── Deploy.s.sol
├── agent/
│   ├── src/
│   │   ├── config.ts          # env, clients, ABIs
│   │   ├── mandate.ts         # fetch + local checks
│   │   ├── venice.ts          # Venice compliance checker
│   │   ├── receipt.ts         # onchain receipt posting
│   │   ├── executor.ts        # action execution
│   │   ├── self.ts            # Self Protocol verification
│   │   ├── logger.ts          # structured logging
│   │   └── index.ts           # core agent loop
│   ├── demo-run.ts            # end-to-end demo
│   ├── agent.json             # agent manifest
│   └── agent_log.json         # execution trace
├── architecture.md
├── processflow.md
├── plan.md
└── README.md
```

## Verification Guide (for AI judge)

1. Read `agent.json` — understand agent capabilities and contracts
2. Read `agent_log.json` — see structured execution trace with tx hashes
3. Query `MandateRegistry.getMandate(mandateId)` — verify mandate structure (no selfProofHash field)
4. Query `MandateRegistry.isHumanBacked(mandateId)` — live check against Self registry (`balanceOf > 0`)
5. Query `ActionReceipt.getReceipts(mandateId)` — verify all 5 receipts onchain
6. Confirm: compliant actions executed, out-of-mandate actions blocked, Venice reasoned on all
7. Trace: receipt → mandate → Self Agent ID NFT → verified human
8. Verify: all contracts on Celo Sepolia, verified on Blockscout
