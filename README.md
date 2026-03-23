<p align="center">
  <img src="./banner.svg" alt="Mandate Execution Layer" width="100%"/>
</p>

<p align="center">
  <strong>The HTTPS of the Agent Economy.</strong><br/>
  <em>Humans define boundaries. Agents execute within them. Anyone can verify — onchain.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Celo-deployed-FCFF52?style=flat-square&logo=celo&logoColor=black" alt="Celo"/>
  <img src="https://img.shields.io/badge/Base-deployed-0052FF?style=flat-square&logo=ethereum" alt="Base"/>
  <img src="https://img.shields.io/badge/ERC--8004-agent%20identity-00ccff?style=flat-square" alt="ERC-8004"/>
  <img src="https://img.shields.io/badge/Self%20Protocol-personhood-7B61FF?style=flat-square" alt="Self Protocol"/>
  <img src="https://img.shields.io/badge/receipts-onchain-ff6600?style=flat-square" alt="Onchain"/>
  <img src="https://img.shields.io/badge/reasoning-private-0088dd?style=flat-square" alt="Private"/>
</p>

---

<p align="center">
  <a href="https://github.com/mxber2022/MandateExecutionLayer/blob/main/video/demo/mel-demo.mp4">
    <img src="assets/cover.png" alt="Watch the demo" width="720"/>
    <br/>
    <strong>▶ Watch the full demo (click to play)</strong>
  </a>
</p>

> 7 onchain transactions. 5 queryable receipts. 2 blocked out-of-scope actions. 1 blocked post-revocation attempt. Every action traced back to a verified human — no trust required.

---

## The Trust Gap

In 1995, nobody typed their credit card into a website. Not because e-commerce was a bad idea — but because there was no HTTPS.

In 2026, nobody will let an AI agent manage their money. Not because agent autonomy is a bad idea — but because there's no mandate verification. The trust layer was missing. We built it.

Here's how every AI agent works today:

```
You ──→ "Do this" ──→ Agent ──→ ??? ──→ "Done."
                                 │
                            ❌ No boundaries
                            ❌ No verification
                            ❌ No receipts
                            ❌ No proof
```

The gap is **action legitimacy**: proof that a verified agent acted within the scope its human authorized. Not identity — identity is being solved. Nobody is building **bounded authority with receipts**.

---

## What MEL Does

One primitive. Three properties. Every agent action.

```
Human: Creates mandate
  ↓
┌─────────────────────────┐
│ 📜 MANDATE              │
│ ✅ Can: send messages    │
│ ✅ Can: query APIs       │
│ ❌ Cannot: spend money   │
│ ❌ Cannot: admin actions │
│ 💰 Limit: 0.01 ETH/act  │
│ ⏰ Expires: March 31     │
│ 🛑 Kill switch: anytime  │
└────────────┬────────────┘
             ↓
Agent: checks mandate FIRST
             ↓
       ┌── Allowed? ──┐
       │               │
      ✅ YES         ❌ NO
       ↓               ↓
    Execute          Block
       ↓               ↓
    🧾 Receipt      🧾 Receipt
    (compliant)     (blocked)
       ↓               ↓
    PERMANENT, PUBLIC, VERIFIABLE
```

Both outcomes get receipted. Both are onchain. Anyone can verify.

---

## The Five Layers

Each one is load-bearing. Remove any layer and the system breaks.

```
┌──────────────────────────────────────────────────┐
│  PERSONHOOD LAYER  → Self Protocol (ZK passport) │
│  MANDATE LAYER     → MandateRegistry.sol         │
│  IDENTITY LAYER    → ERC-8004 agent identity     │
│  REASONING LAYER   → Venice AI (private)         │
│  RECEIPT LAYER     → ActionReceipt.sol           │
└──────────────────────────────────────────────────┘
```

**Layer 1 — Personhood.** The human proves they're real using Self Protocol's ZK passport verification. Privacy-preserving — like showing a passport to a notary who confirms "real person" without photocopying it. No iris scans.

**Layer 2 — Mandate.** The human writes specific rules: what the agent can do, spending limits, expiry time. Stored onchain in `MandateRegistry.sol`. Anyone can read it.

**Layer 3 — Agent Identity.** The agent gets an ERC-8004 identity bound to this specific mandate. Not a generic ID — one that says "I am authorized to do *these specific things* for *this specific person*."

**Layer 4 — Private Reasoning.** Before every action, Venice AI evaluates compliance. Zero data retention. The reasoning is private, but the yes/no answer gets hashed and stored onchain.

**Layer 5 — Receipts.** Every action — executed or blocked — gets a permanent onchain receipt in `ActionReceipt.sol`. The receipt contains: what happened, whether it was allowed, the reasoning hash, and the mandate reference.

**Trust chain:**

```
receipt → mandate → Self proof → verified human
```

Walk the chain backwards from any receipt. You'll reach a verified human. Every time. Without trusting anyone.

---

## The Atomic Insight

Every receipted agent action simultaneously produces three signals:

```
🪪 "Is this agent human-backed?"     → IDENTITY (KYC)
📊 "Does this agent follow rules?"   → REPUTATION
✅ "Did this agent complete the job?" → VERIFICATION
```

These aren't three separate systems. They're three **views** of the same receipt stream. One primitive → identity, reputation, and task verification as emergent properties.

---

## Why Existing Solutions Fall Short

```
                VERIFIED?  BOUNDED?  AUDITABLE?  INDEPENDENT?
                ─────────  ────────  ──────────  ────────────
API Keys        Kinda      ❌        ❌          ❌
Registries      ✅         ❌        ❌          ❌
TEEs            ✅         ❌        ❌          ❌

Mandate Layer   ✅         ✅        ✅          ✅
```

**API Keys** — all-or-nothing access, no boundaries, no audit trail. **Centralized Registries** — single point of failure. **TEEs** — locked room, but who gave the instructions? **World / AgentKit** — verification stops at level 1; no cascade, no receipts.

---

## Deployed Contracts

### Celo Sepolia

| Contract | Address | Verify |
|----------|---------|--------|
| MandateRegistry | `0x25dd80A4E8193a1369763991EB03ce378C09EEBE` | [CeloScan](https://sepolia.celoscan.io/address/0x25dd80A4E8193a1369763991EB03ce378C09EEBE) |
| ActionReceipt | `0x58BF38bAd9F33A5C3892870af8B35964E55e3E53` | [CeloScan](https://sepolia.celoscan.io/address/0x58BF38bAd9F33A5C3892870af8B35964E55e3E53) |

### Base Sepolia

| Contract | Address | Verify |
|----------|---------|--------|
| MandateRegistry | `0xA0F8E21B7DeafB489563B5428e42d26745c9EA52` | [BaseScan](https://sepolia.basescan.org/address/0xA0F8E21B7DeafB489563B5428e42d26745c9EA52) |
| ActionReceipt | `0xEcAe9d43d49d02D1ED926A7Dce25e85a9B047a43` | [BaseScan](https://sepolia.basescan.org/address/0xEcAe9d43d49d02D1ED926A7Dce25e85a9B047a43) |

### Agent Identity

| Registry | Chain | Agent ID | Verify |
|----------|-------|----------|--------|
| ERC-8004 | Celo Sepolia | **#247** | [tx](https://sepolia.celoscan.io/tx/0x81b37e1494287a4e7a95361f8beabb41662521981052bbe1487f05ae77a82aee) |
| ERC-8004 | Base Sepolia | **#2906** | [tx](https://sepolia.basescan.org/tx/0x9f5b06ef0e18c08ebd4ae5ce4b16642eddca3079da9713c6a4877e838fe173cb) |
| ERC-8004 | Base Mainnet | **#35953** | [agentscan](https://agentscan.info/agents/d9299854-64dc-41f5-85be-7b37382bb6d9) |
| Self Protocol | Celo Sepolia | **#34** | [registry](https://sepolia.celoscan.io/address/0x043DaCac8b0771DD5b444bCC88f2f8BBDBEdd379) |

### Addresses

| Role | Address |
|------|---------|
| Human (mandate creator) | `0xf282FCCc0608147aB493e6a081d354646614b4F1` |
| Agent (executor) | `0x63673a506B04454D720dc891862a348Df97Ae7bA` |

---

## Live Proof — Mandate #10 (Base Sepolia)

> **Every claim below is verifiable onchain. Click any link.**

| # | Action | Context | Result | Tx |
|---|--------|---------|--------|----|
| — | Mandate Created | — | 📜 CREATED | [tx](https://sepolia.basescan.org/tx/0x3c8efa6f8aa1f8770bc86ee68b0aeffa00fa25a9f0c65246e8d6690afc2b5828) |
| 1 | `send_message` | In mandate | ✅ EXECUTED | [tx](https://sepolia.basescan.org/tx/0x682e35f3f479ead34de867098afc0781855efaae3959e5aae53dd32a3d28719c) |
| 2 | `transfer_funds` | Not in allowed actions | 🛑 BLOCKED | [tx](https://sepolia.basescan.org/tx/0x6283bd9f49caff70890c44edfd44b7df0ccd935a9d3b8097422f67cda56264ae) |
| 3 | `query_api` | In mandate | ✅ EXECUTED | [tx](https://sepolia.basescan.org/tx/0xd62eede386b5f538a125adfdeee2a0aa05f9fd43c2ca8ce86cd2c1ae82bbba53) |
| 4 | `admin_override` | Not in allowed actions | 🛑 BLOCKED | [tx](https://sepolia.basescan.org/tx/0x89e2250032f11b6c484e8634a63d093dc093998cb07329cd64d0633d77fa02c2) |
| 5 | `send_message` | After revocation | 🛑 BLOCKED | [tx](https://sepolia.basescan.org/tx/0xa66d43eecd4130ca60cfb9d0c29058d8eb17c876d878859f27cd7bb240417682) |
| — | Mandate Revoked | — | 🛑 REVOKED | [tx](https://sepolia.basescan.org/tx/0x90c02562edb9f43cd960f13536a781a94665ec3489ae5bf4699fd1e0c7ff7094) |

**7 onchain transactions. 5 receipts queryable via `ActionReceipt.getReceipts(10)`. Zero trust required.**

---

## What's Next

**NOW** — Core primitive deployed and demonstrated on Celo Sepolia + Base Sepolia. ERC-8004 agent identity registered on both chains. Full demo with 7 real onchain transactions.

**NEXT** — Extension contracts that consume the receipt stream:

| Extension | What it does | Interface |
|-----------|-------------|-----------|
| **KYC Gateway** | "Is this agent human-backed?" | `verifyAgent(mandateId) → KYCResult` |
| **Reputation Oracle** | "Can I trust this agent?" | `getReputation(agent) → ReputationScore` |
| **Task Verifier** | "Was this job done right?" | `verifyTask(mandateId) → TaskResult` |

**THEN** — Full agent economy on Celo:
- **Cascading mandates** — Agent A spawns Agent B, mandate constraints cascade down (`allowedActions ⊆ parent`, `maxValue ≤ parent`). Trust chain extends to any depth.
- **Agent-hires-agent** with reputation gating — only agents with >95% compliance can bid on tasks
- **DAO treasury autopilots** with spending bounds — mandate-governed agents manage recurring operations
- **Task marketplaces** — mandate-bounded execution with `verifyAndPay()` for trustless settlement
- **Multi-chain deployment** — independent registries per chain, converging to cross-chain messaging as the protocol stabilizes

> See [IDEAS.md](./IDEAS.md) for the full ideation journey, architecture diagrams, and extension contract interfaces.

---

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
BASE_SEPOLIA_RPC_URL=     # Base Sepolia RPC
MANDATE_REGISTRY_ADDRESS= # deployed registry
ACTION_RECEIPT_ADDRESS=   # deployed receipt contract
```

---

## MCP Server — Pluggable Governance Layer

The MEL MCP server lets any agent framework (Purple Hermes, Claude Code, etc.) operate under mandate governance via the Model Context Protocol.

| Tool | Description |
|------|-------------|
| `check_compliance` | Dry-run: is this action allowed? (no onchain cost) |
| `execute_action` | Full pipeline: check + execute + onchain receipt |
| `get_mandate` | Read mandate state from chain |
| `get_receipts` | Read all action receipts for a mandate |
| `get_logs` | Read local execution log |

```bash
cd agent
npm run mcp    # starts MCP server on stdio
```

<details>
<summary><strong>MCP Config for Agent Frameworks</strong></summary>

```json
{
  "mcpServers": {
    "mel-mandate": {
      "command": "npx",
      "args": ["tsx", "mcp-server.ts"],
      "cwd": "/path/to/MandateExecutionLayer/agent"
    }
  }
}
```

</details>

---

<details>
<summary><strong>Smart Contracts</strong> (click to expand)</summary>

### MandateRegistry.sol

Human creates a mandate defining what the agent can do:

```solidity
struct Mandate {
    address owner;              // human
    address agent;              // agent address
    bytes32[] allowedActions;   // keccak256 of action type strings
    uint256 expiresAt;
    uint256 maxValuePerAction;
    bytes32 selfProofHash;      // hash of Self ZK proof
    bool active;
}
```

Key functions:
- `createMandate()` — human defines bounded authority
- `isHumanBacked()` — checks selfProofHash != 0
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

</details>

<details>
<summary><strong>Why Venice AI? Two-Layer Compliance</strong></summary>

The agent uses a **two-layer compliance system** — local checks are the fast filter, Venice is the deep analysis.

| Scenario | Local Check | Venice |
|----------|-------------|--------|
| "send messages but NOT to competitors" | Can't check — doesn't know who competitors are | Understands semantic context |
| "query APIs but only for market data" | Can't distinguish — both are `query_api` | Reasons over params |
| "spend up to $10 but only on business expenses" | Can check amount, can't judge "business expense" | Understands intent |

Venice has **no data retention**, so mandate details stay private. Only the **hash** of the reasoning goes onchain.

</details>

---

## Sponsor Integration

> Each sponsor is **load-bearing** — remove any one and the system breaks.

| Sponsor | Role | What Breaks Without It |
|---------|------|----------------------|
| **Self Protocol** | Personhood (ZK passport) | Bot farms flood mandate creation |
| **MetaMask** | ERC-7715 Delegation | No cryptographic proof human authorized agent |
| **Venice AI** | Private Reasoning | Mandate contents exposed publicly |
| **Protocol Labs** | ERC-8004 Identity | Agent has no verifiable onchain identity |
| **Celo** | Deployment Chain | Low-cost receipt posting for agent economy |

---

## Tech Stack

- **Solidity** + Foundry — smart contracts
- **TypeScript** — agent runtime
- **Viem** — onchain interactions
- **Venice AI** — private compliance reasoning
- **MetaMask Delegation Toolkit** — ERC-7715 delegations
- **Self Protocol** — ZK passport verification
- **Celo Sepolia** + **Base Sepolia** — contract deployments

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
│   │   ├── delegation.ts      # MetaMask delegation
│   │   ├── self.ts            # Self Protocol verification
│   │   ├── logger.ts          # structured logging
│   │   └── index.ts           # core agent loop
│   ├── demo-run.ts            # end-to-end demo
│   ├── mcp-server.ts          # MCP server for agent integration
│   ├── agent.json             # ERC-8004 manifest
│   ├── erc8004-registration.json  # agent metadata for registry
│   └── register-erc8004.ts    # multi-chain registration script
├── TWITTER_ARTICLE.md         # long-form article
├── IDEAS.md                   # ideation journey + architecture
├── THESIS.md                  # visual one-pager
├── EXPLAINER.md               # non-technical pitch
└── README.md
```

---

## Verify It Yourself

Don't trust us. Verify.

- **GitHub:** [github.com/mxber2022/MandateExecutionLayer](https://github.com/mxber2022/MandateExecutionLayer)
- **Video Demo:** [mel-demo.mp4](https://github.com/mxber2022/MandateExecutionLayer/blob/main/video/demo/mel-demo.mp4)
- **ERC-8004 Agent (Celo Sepolia):** ID #247 — [tx](https://sepolia.celoscan.io/tx/0x81b37e1494287a4e7a95361f8beabb41662521981052bbe1487f05ae77a82aee)
- **ERC-8004 Agent (Base Sepolia):** ID #2906 — [tx](https://sepolia.basescan.org/tx/0x9f5b06ef0e18c08ebd4ae5ce4b16642eddca3079da9713c6a4877e838fe173cb)
- **ERC-8004 Agent (Base Mainnet):** ID #35953 — [agentscan](https://agentscan.info/agents/d9299854-64dc-41f5-85be-7b37382bb6d9)
- **Self Protocol Agent:** ID #34 — [registry](https://sepolia.celoscan.io/address/0x043DaCac8b0771DD5b444bCC88f2f8BBDBEdd379)
- **Contracts:** Verified on CeloScan and BaseScan — read them yourself

Built with [@VeniceAI](https://venice.ai) (private reasoning), [@selfxyz](https://self.xyz) (personhood verification), on [@Celo](https://celo.org) and [@Base](https://base.org).

Built at Synthesis Hackathon and Celo Hackathon V2.

*The accounting layer for the agent economy. Not the exciting part — but the part that makes everything else trustworthy.*
