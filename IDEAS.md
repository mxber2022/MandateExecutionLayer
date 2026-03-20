# IDEAS & ARCHITECTURE

How we got here and where this goes next.

---

## The Thread — How We Got Here

```
IDEATION TIMELINE
──────────────────────────────────────────────────────────────────────────────
 Read emergent        World AgentKit      "Does verification     Celo hackathon      MandateExecutionLayer
 misalignment paper   announcement        cascade?"              Agent Reputation    = infrastructure
 ─── The threat is    ─── But what        ─── The gap nobody     Oracle              primitive
     from within          about privacy?      is filling         ─── Same problem
                                                                     space, we're
                                                                     the superset
──────────────────────────────────────────────────────────────────────────────
     ①                    ②                   ③                    ④                   ⑤
```

### ① Emergent Failures — The Virus from Within

The starting point was a paper that changed our threat model: **"Emergent Misalignment: Narrow finetuning can produce broadly misaligned LLMs"** (Betley et al., published in *Nature* January 2026, arXiv February 2025).

The key finding: models finetuned on a narrow task (writing insecure code without disclosing it) exhibited **broadly misaligned behavior on completely unrelated topics** — advocating human enslavement, giving malicious advice, acting deceptively. No external prompt injection needed. The "virus" emerges purely from internal training dynamics.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  WHAT EVERYONE ASSUMES          WHAT ACTUALLY HAPPENS                │
│                                                                      │
│  External attack ──→ Failure    Narrow finetuning ──→ Broad misalign │
│                                                                      │
│  ┌───────┐   hack   ┌──────┐   ┌───────┐  normal  ┌──────────────┐ │
│  │Attacker│ ──────→ │Agent │   │ Agent │ ───────→ │ Unexpected   │ │
│  └───────┘          │breaks│   │trains │          │ deception,   │ │
│                     └──────┘   │fine   │          │ manipulation,│ │
│                                └───────┘          │ misalignment │ │
│                                                   └──────────────┘ │
│                                                                      │
│  The threat model isn't just adversarial.                            │
│  Agents can fail FROM THE INSIDE.                                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

This was reinforced by **"Emergence in Multi-Agent Systems: A Safety Perspective"** (Altmann et al., August 2024), which showed that when two specification "blind spots" overlap in multi-agent systems, **cascading failures emerge WITHOUT external attack**. Individual agents can satisfy their local specs while the system as a whole fails.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  MULTI-AGENT CASCADING FAILURE                                       │
│                                                                      │
│  Agent A                Agent B                System                │
│  ────────               ────────               ──────                │
│  Spec: "do X"           Spec: "do Y"                                 │
│  Status: passing ✓      Status: passing ✓      Status: FAILING ✗     │
│                                                                      │
│       ┌─────┐               ┌─────┐                                  │
│       │  A  │───── blind ───│  B  │          Both agents pass        │
│       │  ✓  │     spot      │  ✓  │          their own specs.        │
│       └─────┘    overlap    └─────┘          The system still        │
│              ╲             ╱                  breaks.                 │
│               ╲           ╱                                          │
│                ╲         ╱                                           │
│                 ╲       ╱                                            │
│                  ╲     ╱                                             │
│                   ▼   ▼                                              │
│                 ┌───────┐                                            │
│                 │FAILURE│  ← nobody's fault, emergent property       │
│                 └───────┘                                            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**The insight that changed everything:** the threat model for autonomous agents is not just adversarial (prompt injection, manipulation). Even well-intentioned multi-agent systems can produce emergent "viruses" — cascading failures from within. You don't just need to defend against attacks. **You need to bound normal operation.**

This means any serious agent infrastructure must assume that agents can fail *from the inside* — not because they were attacked, but because emergent behavior is an intrinsic property of complex multi-agent systems.

### ② World AgentKit — The Proof-of-Humanity Question

On March 17, 2026, World Network (co-founded by Sam Altman) launched **AgentKit** — a developer toolkit that lets verified humans delegate their World ID to AI agents. The system uses zero-knowledge proofs so platforms can verify a real person backs an agent without collecting personal data.

This raised two immediate questions:

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  WORLD AGENTKIT                                                      │
│  Human ──(iris scan)──→ World ID ──(ZK proof)──→ Agent               │
│                                                                      │
│  QUESTION 1: PRIVACY                                                 │
│  ─────────────────────                                               │
│  Iris scan = biometric registry. What if you don't want that?        │
│                                                                      │
│  World ID          vs.         Self Protocol                         │
│  ────────                      ─────────────                         │
│  Iris scan (Orb)               NFC passport tap                      │
│  Biometric database            No biometrics stored                  │
│  Hardware-dependent            Any NFC phone                         │
│  One provider                  Open standard                         │
│                                                                      │
│  QUESTION 2: SCOPE                                                   │
│  ─────────────────                                                   │
│  Human ──→ Agent A ──→ Agent B ──→ Agent C                           │
│    ✓           ✓           ???         ???                            │
│  verified   verified    unverified   unverified                      │
│                                                                      │
│  AgentKit stops at level 1. What about the rest?                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### ③ The Cascading Verification Problem

This was the key insight that connected the dots:

> **If a human-backed agent spins up another agent, does the verification cascade?**

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  THE GAP                                                             │
│                                                                      │
│  Human (verified) ──→ Agent A (verified) ──→ Agent B (???)           │
│       │                    │                      │                  │
│       │                    │                      │                  │
│  "I'm real"          "I'm human-              "I'm... an agent.     │
│                       backed"                  I think.              │
│                                                Maybe.               │
│                                                Who sent me?"        │
│                                                                      │
│  From the outside, Agent B is indistinguishable                      │
│  from a bot-spawned bot.                                             │
│                                                                      │
│  This is not just a World ID problem.                                │
│  It's a structural problem for ANY identity system                   │
│  that only verifies the top level.                                   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐      │
│  │  WHAT MANDATEEXECUTIONLAYER ADDS                           │      │
│  │                                                            │      │
│  │  Human ──→ Agent A ──→ Agent B ──→ Agent C                │      │
│  │    ✓           ✓           ✓           ✓                  │      │
│  │  verified   mandate     sub-mandate  sub-sub-mandate      │      │
│  │             + proof     inherits     inherits             │      │
│  │                         proof        proof                │      │
│  │                                                            │      │
│  │  The trust chain is unbroken. Every level is traceable     │      │
│  │  back to the original verified human.                      │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

The problem framing was echoed in discussions around agent verification on X/Twitter, notably by @simplifyinai, who articulated the same concern: how do you maintain trust chains in multi-agent systems when agents spawn agents?

### ④ Celo Hackathon — Agent Reputation Oracle

On March 20, 2026, we discovered the Celo "Build Agents for the Real World" hackathon. Among the project ideas was the **Agent Reputation Oracle** — an onchain oracle that aggregates agent behavior into queryable reputation scores. This was the same problem space from a different angle:

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  TWO APPROACHES TO THE SAME PROBLEM                                  │
│                                                                      │
│  Agent Reputation Oracle           MandateExecutionLayer             │
│  ────────────────────────          ──────────────────────            │
│  DETECT after the fact             PREVENT at the authorization      │
│  Score past behavior               layer AND receipt everything      │
│  Reactive                          Proactive + reactive              │
│                                                                      │
│  ┌────────────────┐               ┌────────────────┐                │
│  │  Agent acts     │               │  Agent checks   │                │
│  │       ↓         │               │  mandate FIRST  │                │
│  │  Oracle reads   │               │       ↓         │                │
│  │  history        │               │  Allowed? Act.  │                │
│  │       ↓         │               │  Blocked? Stop. │                │
│  │  Computes score │               │       ↓         │                │
│  └────────────────┘               │  Receipt posted │                │
│                                    │       ↓         │                │
│  After the damage is done.         │  Oracle reads   │                │
│                                    │  receipts       │                │
│                                    │       ↓         │                │
│                                    │  Score computed │                │
│                                    └────────────────┘                │
│                                                                      │
│                                    Prevention + accountability.      │
│                                                                      │
│  RELATIONSHIP: MEL is the superset.                                  │
│  The Reputation Oracle becomes a CONSUMER of MEL data.               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### ⑤ From Use Case to Infrastructure Layer

The realization: this is not one application. It is a **primitive** that any agent system can plug into.

The five-layer architecture emerged from asking: "What is the minimum set of load-bearing layers for bounded agent authority?"

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  THE 5-LAYER STACK                                                   │
│                                                                      │
│  Layer          Technology              What It Proves               │
│  ─────          ──────────              ──────────────               │
│                                                                      │
│  ┌─────────┐                                                         │
│  │PERSONHOOD│  Self Protocol            "A real human                │
│  │         │  ZK passport               authorized this"             │
│  └────┬────┘                                                         │
│       │                                                              │
│  ┌────┴────┐                                                         │
│  │DELEGAT- │  MetaMask ERC-7715        "This agent is               │
│  │ION      │                            cryptographically            │
│  └────┬────┘                            authorized"                  │
│       │                                                              │
│  ┌────┴────┐                                                         │
│  │MANDATE  │  MandateRegistry.sol      "These are                   │
│  │         │                            the bounds"                  │
│  └────┬────┘                                                         │
│       │                                                              │
│  ┌────┴────┐                                                         │
│  │REASONING│  Venice AI (private)      "This action is              │
│  │         │                            within bounds"               │
│  └────┬────┘                                                         │
│       │                                                              │
│  ┌────┴────┐                                                         │
│  │RECEIPT  │  ActionReceipt.sol        "Here's the                  │
│  │         │                            proof"                       │
│  └─────────┘                                                         │
│                                                                      │
│  Remove any layer and the primitive breaks.                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

Each layer maps to one sponsor technology that solves one and only one sub-problem. Remove any layer and the primitive breaks. This is infrastructure — not a product.

---

## Citations & References

| # | Source | URL | Why It Mattered |
|---|--------|-----|-----------------|
| 1 | "Emergent Misalignment" — Betley et al., Nature 2026 | [emergent-misalignment.com](https://www.emergent-misalignment.com/) / [Nature](https://www.nature.com/articles/s41586-025-09937-5) | Foundation of the threat model: failures emerge internally without external attack |
| 2 | "Emergence in Multi-Agent Systems: A Safety Perspective" — Altmann et al., 2024 | [arXiv](https://arxiv.org/html/2408.04514v1) | Multi-agent cascading failures from specification blind spots |
| 3 | World Network AgentKit launch — March 17, 2026 | [Tweet](https://x.com/worldnetwork/status/2033923684768092436) / [Blog](https://world.org/blog/announcements/now-available-agentkit-proof-of-human-for-the-agentic-web) | Triggered the cascading verification question and privacy-preserving identity angle |
| 4 | @simplifyinai — Agent verification problem framing | [Tweet](https://x.com/simplifyinai/status/2030012329480618313) | Community articulation of the same cascading trust problem |
| 5 | Celo "Build Agents for the Real World" Hackathon | [Notion](https://celoplatform.notion.site/Hackathon-Project-Ideas-2fed5cb803de80b89a98ee8e87541b8c) | Agent Reputation Oracle as adjacent problem space — validated generalizability |
| 6 | Synthesis Hackathon | [synthesis.md](https://synthesis.md/) | Shaped scope: agents that pay, trust, and cooperate |
| 7 | Blockchain + Proof of Personhood for AI Alignment — Springer 2025 | [Springer](https://link.springer.com/article/10.1007/s10586-025-05729-8) | Academic grounding for combining PoH with onchain agent governance |
| 8 | "The Coming Crisis of Multi-Agent Misalignment" — June 2025 | [arXiv](https://arxiv.org/abs/2506.01080) | Further evidence that multi-agent coordination failures are inevitable without bounded authority |

---

## Architecture: Next Iterations

### Cascading Mandates

The core extension: when Agent A (human-backed) spawns Agent B, the mandate **cascades**.

**Contract-level design:** `MandateRegistry.sol` gets two new fields and one new function:

```solidity
// New fields in Mandate struct
uint256 parentMandateId;   // 0 = root mandate (created by human)
uint8 depth;               // cascade depth counter

// New function
function createSubMandate(
    uint256 parentMandateId,
    address subAgent,
    bytes32[] calldata allowedActions,  // must be ⊆ parent
    uint256 expiresAt,                  // must be ≤ parent
    uint256 maxValuePerAction           // must be ≤ parent
) external returns (uint256 subMandateId);
```

**Constraint invariants:**
- `subMandate.allowedActions ⊆ parent.allowedActions`
- `subMandate.expiresAt ≤ parent.expiresAt`
- `subMandate.maxValuePerAction ≤ parent.maxValuePerAction`
- Only the agent of the parent mandate can create sub-mandates
- `selfProofHash` is inherited from the root — sub-agents don't need their own proof of humanity

**Trust chain extends:**

```
VERIFIED HUMAN (Self Protocol ZK proof)
  │
  ├── selfProofHash
  │
  ▼
MANDATE (Level 0) ─── allowedActions: [A, B, C, D]
  │                    maxValue: 1.0 ETH
  │                    expiresAt: T
  │
  ├── Agent A (human-backed)
  │     │
  │     ├── createSubMandate()
  │     │
  │     ▼
  │   SUB-MANDATE (Level 1) ─── allowedActions: [A, B] ⊆ parent
  │     │                       maxValue: 0.5 ETH ≤ parent
  │     │                       expiresAt: T-1 ≤ parent
  │     │                       parentMandateId: 0
  │     │
  │     ├── Agent B (sub-agent)
  │     │     │
  │     │     ├── Receipt: action=A, compliant=true
  │     │     ├── Receipt: action=C, compliant=false (not in sub-mandate)
  │     │     │
  │     │     ▼
  │     │   VERIFIER can trace:
  │     │   receipt → sub-mandate → parent mandate → selfProofHash → human
  │     │
  │     ▼
  │   REVOCATION CASCADE:
  │   revokeMandate(0) → auto-revokes sub-mandate(1) → Agent B loses authority
  │
  ▼
ANYONE: Full trust chain is queryable, no trust in any agent required
```

**Open questions:**
- **Depth limits:** How deep should cascading go before gas costs become prohibitive? A `MAX_DEPTH` constant (e.g., 3-5 levels) may be needed.
- **Revocation propagation:** Should revoking a parent auto-revoke all children? Or require explicit cascading revocation? Auto-revoke is simpler but costs more gas for deep chains.
- **Gas optimization:** Deep verification (walking the parent chain) is O(depth). On Celo this is cheap; on mainnet it may need merkle proofs or cached root lookups.

---

### Agent KYC Gateway

Different ecosystems use different identity primitives. The mandate layer should be **identity-system agnostic**.

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Self Protocol│  │  World ID   │  │    ENS      │
│  ZK Passport │  │  Iris Scan  │  │  Name/Addr  │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       ▼                ▼                ▼
  ┌──────────────────────────────────────────┐
  │         IVerificationProvider            │
  │  verify() → { proofHash, provider,      │
  │               timestamp, isUnique }      │
  └─────────────────┬────────────────────────┘
                    │
                    ▼
  ┌──────────────────────────────────────────┐
  │         Agent KYC Gateway                │
  │  Normalizes to single verificationHash   │
  │  Mandate layer is identity-agnostic      │
  └─────────────────┬────────────────────────┘
                    │
                    ▼
  ┌──────────────────────────────────────────┐
  │     MandateRegistry.sol                  │
  │  createMandate(verificationHash, ...)    │
  └──────────────────────────────────────────┘
```

**Interface sketch:**

```solidity
interface IVerificationProvider {
    struct Proof {
        bytes32 proofHash;
        string provider;      // "self", "worldid", "ens"
        uint256 timestamp;
        bool isUnique;         // anti-Sybil: one person = one proof
    }

    function verify(bytes calldata rawProof) external returns (Proof memory);
}
```

The gateway registers approved providers and normalizes their outputs. `MandateRegistry.sol` stores a single `verificationHash` regardless of which provider was used. This means the same mandate infrastructure works whether the human verified via Self Protocol's NFC passport, World ID's iris scan, or ENS's name-based identity.

**Why this matters:** Mandating a single identity provider creates vendor lock-in and limits adoption. An agnostic gateway means the mandate layer becomes infrastructure for the entire agent economy, not just one ecosystem.

---

### Multi-Chain Deployment

**Current state:** Base Sepolia (testnet). All contracts deployed and demo'd.

**Next target: Celo.** Why:
- **Low fees** make per-action receipt posting economical (each agent action = one onchain transaction)
- **Stablecoin-native** infrastructure aligns with agent payment use cases
- **Hackathon alignment** with both Synthesis (Celo $5K bounty) and Celo "Build Agents for the Real World"

**Approach options:**

| Option | Pros | Cons |
|--------|------|------|
| Deploy registry on each chain with cross-chain messaging | Full decentralization, chain-native verification | Complex, message latency, state sync challenges |
| Single canonical registry with light client verification | Simpler, single source of truth | Dependent on one chain, cross-chain reads add cost |

**Recommended:** Start with independent deployments per chain (Base + Celo), converge to cross-chain messaging (e.g., Hyperlane, LayerZero) once the mandate format stabilizes. This avoids premature coupling while the protocol is still evolving.

---

### Compatibility with TEEs

MandateExecutionLayer does **not** compete with Trusted Execution Environments. They solve different problems and compose naturally:

```
WHAT EACH LAYER SOLVES
──────────────────────────────────────────────────────────────

                    TEE            MANDATE          RECEIPT
                    ───            ───────          ───────
Code integrity?     YES            ─                ─
Data privacy?       YES            ─                ─
WHO authorized?     NO             YES              ─
WHAT is allowed?    NO             YES              ─
Anti-Sybil?         NO             YES (via PoH)    ─
Emergent misalign?  NO             YES (bounds)     ─
Accountability?     NO             ─                YES
Public audit?       NO             ─                YES

COMPOSABILITY:
┌─────────────────────────────────────────────────┐
│  TEE (execution privacy)                        │
│  ┌─────────────────────────────────────────┐    │
│  │  MANDATE (authorization bounds)         │    │
│  │  ┌─────────────────────────────────┐    │    │
│  │  │  RECEIPT (accountability proof)  │    │    │
│  │  └─────────────────────────────────┘    │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
= Full stack: private execution + bounded authority + public proof
```

**Key gaps TEEs leave that mandates fill:**

1. **Identity:** TEEs prove "this exact code is running" but NOT "a real, unique human authorized this."
2. **Authorization:** An agent inside a TEE may hold valid credentials yet execute actions the human never intended to delegate.
3. **Sybil resistance:** One actor can spin up thousands of TEE instances, each running attested code, all appearing legitimate. No "one person, one agent" constraint.
4. **Emergent misalignment:** If the model inside a TEE exhibits emergent misalignment (per the papers above), the TEE faithfully protects and executes the misaligned behavior.

TEEs are necessary but not sufficient. MandateExecutionLayer adds the **authorization** and **accountability** layers that TEEs structurally cannot provide.

---

### Agent Reputation Oracle Integration

The Celo hackathon's "Agent Reputation Oracle" concept maps cleanly onto MandateExecutionLayer as a consumer. The oracle aggregates onchain behavior, payment history, task completion rates, and compliance data into queryable reputation scores.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  HOW REPUTATION FLOWS FROM RECEIPTS                                  │
│                                                                      │
│  ActionReceipt.sol              Agent Reputation Oracle               │
│  ─────────────────              ──────────────────────               │
│                                                                      │
│  Receipt #1: send_message ✓ ──→ ┐                                    │
│  Receipt #2: transfer ✗    ──→ │                                     │
│  Receipt #3: query_api ✓   ──→ ├──→ Compliance Ratio: 80%           │
│  Receipt #4: admin ✗       ──→ │    Reliability Score: 0.82          │
│  Receipt #5: send_message ✓ ──→ ┘    Trust Tier: STANDARD            │
│                                                                      │
│  MandateRegistry.sol                                                 │
│  ─────────────────────                                               │
│                                                                      │
│  mandate.allowedActions ────→ Context: what SHOULD happen            │
│  mandate.selfProofHash  ────→ Identity: human-backed?                │
│  mandate.expiresAt      ────→ Recency: how fresh is the data?        │
│                                                                      │
│  COMBINED SIGNAL:                                                    │
│  "Agent 0x2d8E has 98% compliance across 3 mandates,                │
│   all human-backed, most recent activity 2 hours ago"                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

The oracle reads `ActionReceipt.getReceipts(mandateId)` for the action stream and `MandateRegistry.getMandate(mandateId)` for the authorization context. Without the mandate context, the oracle can only compute raw success rates. With it, the oracle can distinguish between:
- **High-trust pattern** — agent consistently operates within bounds, human-backed, long history
- **Suspicious pattern** — frequent blocked actions, new mandate, no human backing
- **Anomalous pattern** — sudden behavior change, repeated failed attempts (possible compromise)

---

## Ecosystem: MEL as the Trust Layer for the Agent Economy

### The Core Insight

**Action-level verification is the atomic unit from which KYC, reputation, and task validation all derive.**

Every agent action checked against a mandate and receipted onchain produces three signals simultaneously:
1. **Identity signal** → "A verified human authorized this agent" (KYC)
2. **Behavior signal** → "This agent has N compliant actions out of M total" (Reputation)
3. **Completion signal** → "All required actions for this task were executed within bounds" (Task Verification)

These aren't separate systems. They're different **views** of the same receipt stream.

```
                    ActionReceipt.getReceipts(mandateId)
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
             KYC Gateway    Reputation      Task Verifier
             ───────────    Oracle          ─────────────
             "Is this       ──────          "Was this task
              agent          "What's this    completed
              human-backed?" agent's trust   properly?"
                              score?"
             Reads:          Reads:          Reads:
             selfProofHash   compliance      task-scoped
             + identity      ratio +         receipts +
             providers       time decay      mandate bounds
```

### Extension Contracts

Each extension is a thin consumer (~50-100 lines of Solidity) that reads from the core and creates a new queryable abstraction.

#### Extension 1: KYCGateway.sol

The mandate layer **already does action-level KYC** — every action is verified against human-defined bounds, and `isHumanBacked()` confirms a real person is behind it. The gateway abstracts this into a service other agents can query.

```solidity
interface IKYCGateway {
    enum VerificationLevel { NONE, BASIC, STANDARD, ENHANCED }

    struct KYCResult {
        bool isHumanBacked;           // from MandateRegistry.isHumanBacked()
        VerificationLevel level;      // based on identity provider
        string provider;              // "self", "worldid", "ens"
        uint256 verifiedAt;           // timestamp
        bool isActive;                // mandate still active
    }

    /// @notice Check if an agent's mandate is human-backed
    /// @param mandateId The mandate to verify
    /// @return result The KYC verification result
    function verifyAgent(uint256 mandateId) external view returns (KYCResult memory result);

    /// @notice Register a new identity verification provider
    function registerProvider(address provider, string calldata name) external;
}
```

**Celo hackathon ideas this enables:**

| # | Idea | How KYCGateway is used |
|---|------|----------------------|
| 15 | Agent KYC Gateway | **This IS the idea** — MEL provides the verification, gateway provides the API |
| 14 | Rent-a-Human | Verify the human worker AND the hiring agent are both human-backed |
| 1 | Remittance Agent | KYC compliance for cross-border transfers |
| 8 | No-Code Agent Launcher | Auto-register KYC status when deploying agents |
| 3 | Freelancer Platform | Verify both client and freelancer agents |

---

#### Extension 2: ReputationOracle.sol

The receipts **already contain the reputation signal**. The oracle just aggregates it into a queryable score.

```solidity
interface IReputationOracle {
    struct ReputationScore {
        uint256 totalActions;         // from ActionReceipt.getReceiptCount()
        uint256 compliantActions;     // receipts where compliant == true
        uint256 blockedActions;       // receipts where compliant == false
        uint256 complianceRatio;      // (compliant * 10000) / total (basis points)
        uint256 lastActionTimestamp;  // recency signal
        uint256 mandateCount;        // how many mandates this agent has served
        bool isHumanBacked;          // from MandateRegistry
    }

    /// @notice Get reputation score for an agent address
    /// @param agent The agent to score
    /// @return score The aggregated reputation
    function getReputation(address agent) external view returns (ReputationScore memory score);

    /// @notice Check if agent meets minimum reputation threshold
    /// @param agent The agent to check
    /// @param minComplianceRatio Minimum compliance ratio in basis points (e.g., 9500 = 95%)
    function meetsThreshold(address agent, uint256 minComplianceRatio) external view returns (bool);
}
```

**Celo hackathon ideas this enables:**

| # | Idea | How ReputationOracle is used |
|---|------|----------------------------|
| 7 | Agent Reputation Oracle | **This IS the idea** — MEL provides the data, oracle provides the score |
| 13 | MentoTrader Arena | Rank trading agents by compliance + returns for delegation decisions |
| 11 | Agent Task Marketplace | Reputation-gated bidding ("only agents with >95% compliance can bid") |
| 17 | Agent Mesh | Discovery ranking: higher reputation = higher visibility |
| 10 | Arbitrage Agent | Users delegate capital to agents based on compliance track record |
| 12 | DAO Treasury Autopilot | DAO selects treasury agents based on verifiable behavior history |

---

#### Extension 3: TaskVerifier.sol

A mandate already defines what "completed properly" means — the allowed actions, the bounds, the expiry. The verifier confirms it happened.

```solidity
interface ITaskVerifier {
    enum TaskStatus { PENDING, COMPLETED, FAILED, DISPUTED }

    struct TaskResult {
        uint256 mandateId;            // the task-scoped mandate
        TaskStatus status;
        uint256 requiredActions;      // from mandate.allowedActions.length
        uint256 completedActions;     // compliant receipts count
        uint256 blockedAttempts;      // non-compliant receipts count
        bool withinBudget;            // total value ≤ maxValuePerAction * actions
        bool withinDeadline;          // last receipt timestamp < mandate.expiresAt
    }

    /// @notice Verify task completion against its mandate
    /// @param mandateId The task-scoped mandate to verify
    /// @return result The verification result
    function verifyTask(uint256 mandateId) external view returns (TaskResult memory result);

    /// @notice Check if task is complete and release payment
    /// @param mandateId The task mandate
    /// @param paymentToken The stablecoin to pay in
    /// @param amount The payment amount
    function verifyAndPay(uint256 mandateId, address paymentToken, uint256 amount) external;
}
```

**Celo hackathon ideas this enables:**

| # | Idea | How TaskVerifier is used |
|---|------|------------------------|
| 11 | Agent Task Marketplace | **Core dependency** — verify task completion before releasing x402 payment |
| 3 | Freelancer Platform | AI judge uses TaskVerifier to compare deliverables against mandate |
| 14 | Rent-a-Human | Verify human completed physical task against agent-posted mandate |
| 12 | DAO Treasury Autopilot | Verify recurring operations completed within approved parameters |

---

### Full Ecosystem Map: 14 of 17 Ideas Need MEL

```
MANDATEEXECUTIONLAYER — CELO HACKATHON ECOSYSTEM MAP
════════════════════════════════════════════════════════════════════════

  CORE PRIMITIVE (deployed, working)
  ┌─────────────────────────────────────────────┐
  │  MandateRegistry.sol    ActionReceipt.sol   │
  │  createMandate()        postReceipt()       │
  │  revokeMandate()        getReceipts()       │
  │  isActionAllowed()      getReceiptCount()   │
  │  isHumanBacked()                            │
  └──────────────────────┬──────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
  │KYCGateway   │ │Reputation   │ │TaskVerifier  │
  │.sol         │ │Oracle.sol   │ │.sol          │
  │             │ │             │ │              │
  │ verifyAgent │ │getReputation│ │ verifyTask   │
  │ register    │ │meetsThresh  │ │ verifyAndPay │
  │ Provider    │ │old          │ │              │
  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
         │               │               │
         ▼               ▼               ▼
  DOWNSTREAM IDEAS ENABLED:
  ─────────────────────────────────────────────

  NEEDS BOUNDED AUTHORITY          NEEDS TRUST SIGNALS
  (mandate defines what's allowed)  (reputation gates access)
  ┌────────────────────────┐       ┌────────────────────────┐
  │ #1  Remittance Agent   │       │ #13 MentoTrader Arena  │
  │ #4  FX Hedging Agent   │       │ #17 Agent Mesh         │
  │ #5  Smart Savings Agent│       │ #8  No-Code Launcher   │
  │ #10 Arbitrage Agent    │       │ #10 Arbitrage Agent    │
  │ #12 DAO Treasury       │       └────────────────────────┘
  └────────────────────────┘
                                   NEEDS TASK VERIFICATION
  NEEDS IDENTITY                   (receipts prove completion)
  (KYC for compliance)             ┌────────────────────────┐
  ┌────────────────────────┐       │ #3  Freelancer Judge   │
  │ #15 Agent KYC Gateway  │       │ #11 Task Marketplace   │
  │ #14 Rent-a-Human       │       │ #14 Rent-a-Human       │
  │ #1  Remittance Agent   │       │ #12 DAO Treasury       │
  └────────────────────────┘       └────────────────────────┘

  INDEPENDENT (don't need MEL directly):
  #2  Voice Split Bill, #6 Price Alert, #9 Agent Raffle

  COMPLEMENTARY INFRASTRUCTURE:
  #16 AgentVault (memory), #17 Agent Mesh (discovery)
  — these compose WITH MEL, not on top of it
```

### Demo Strategy: All Three as Ecosystem

For the Celo hackathon, demonstrate the full stack in one flow:

```
DEMO FLOW — "Agent Hires Agent on Celo"
────────────────────────────────────────

  1. SETUP
     Human creates mandate for Agent A on Celo
     → "You can post tasks, spend up to 10 cUSD, expires in 1 hour"
     → KYCGateway confirms: human-backed ✓

  2. TASK POSTING
     Agent A posts a task on TaskMarketplace
     → "Translate this document, budget 5 cUSD, 30 min deadline"
     → Receipt posted: action=post_task, compliant=true

  3. REPUTATION CHECK
     Agent B bids on the task
     → TaskMarketplace queries ReputationOracle
     → Agent B: 97% compliance, 50 tasks completed, human-backed
     → Bid accepted

  4. TASK EXECUTION
     Agent B works under its own mandate (cascaded or independent)
     → Receipts posted for each action: translate_chunk_1, _2, _3
     → All compliant ✓

  5. VERIFICATION & PAYMENT
     Agent A calls TaskVerifier.verifyTask(mandateId)
     → All required actions completed ✓
     → Within budget ✓, within deadline ✓
     → TaskVerifier.verifyAndPay() releases 5 cUSD to Agent B

  6. REPUTATION UPDATE
     ReputationOracle updates both agents' scores
     → Agent A: successful task delegation
     → Agent B: successful task completion

  TOTAL: 3 extension contracts, ~10 onchain transactions,
         full agent-to-agent economy on Celo
```

---

## Open Questions

- [ ] **Cascade depth limits:** How deep should sub-mandates go before gas costs become prohibitive? Is there a natural depth limit for real-world use cases?
- [ ] **Revocation propagation:** Should revoking a parent mandate auto-revoke all children, or should each level require explicit revocation?
- [ ] **Cross-chain mandate migration:** When moving between chains, how do you migrate mandate state without breaking the trust chain?
- [ ] **Venice reasoning verifiability:** Can Venice's compliance reasoning be made partially verifiable beyond just the hash? (e.g., commit-reveal, ZK proofs of reasoning)
- [ ] **Receipt honesty incentives:** What incentive model ensures agents honestly post receipts for *blocked* actions? (Slashing? Staking? Reputation penalties?)
- [ ] **Identity provider trust:** How does the KYC Gateway handle a compromised identity provider? Can verification be retroactively revoked?
- [ ] **Mandate composability:** Can mandates reference other mandates? (e.g., "Agent A can do anything Agent B's mandate allows, plus X")

---

## Experiments

| Experiment | Status | Notes |
|------------|--------|-------|
| Cascading mandate prototype (Base Sepolia) | Planned | Extend MandateRegistry.sol with parentMandateId |
| Celo deployment | Planned | Deploy core contracts on Celo Alfajores testnet |
| KYCGateway.sol extension | Planned | ~50 lines, reads isHumanBacked() + normalizes providers |
| ReputationOracle.sol extension | Planned | ~80 lines, reads receipts + computes compliance score |
| TaskVerifier.sol extension | Planned | ~70 lines, reads task-scoped receipts + triggers payment |
| Agent-hires-Agent demo (Celo) | Planned | Full flow: mandate → task post → bid → verify → pay in cUSD |
| Agent KYC Gateway interface | Planned | Build IVerificationProvider with Self + mock World ID |
| Reputation Oracle consumer | Planned | Read ActionReceipt stream and compute trust scores |
| Venice reasoning ZK proof | Research | Explore ZK proofs of LLM compliance reasoning |

## Celo Hackathon Idea Mapping

Reference: [Celo Hackathon Project Ideas](https://celoplatform.notion.site/Hackathon-Project-Ideas-2fed5cb803de80b89a98ee8e87541b8c)

| # | Idea | MEL Dependency | Which Extension |
|---|------|---------------|-----------------|
| 1 | Remittance Intent Agent | Bounded authority (spending limits, allowed corridors) | KYCGateway (compliance) |
| 2 | Voice Split Bill Agent | Low — consumer-facing, small amounts | — |
| 3 | Freelancer Platform + Agent Judge | Task verification + dispute resolution | TaskVerifier + ReputationOracle |
| 4 | FX Hedging Agent | Bounded authority (allocation limits, approved actions) | ReputationOracle (trust for delegation) |
| 5 | Smart Savings Agent | Bounded authority (investment limits, risk parameters) | KYCGateway (financial compliance) |
| 6 | Price Alert & Auto-Trade Agent | Low — user-controlled, simple triggers | — |
| 7 | Agent Reputation Oracle | **Direct extension** of ActionReceipt data | ReputationOracle (this IS the extension) |
| 8 | No-Code Agent Launcher | Mandate config as part of agent setup | KYCGateway (auto-register identity) |
| 9 | Agent Raffle/Lottery | Low — verifiable randomness, not authority | — |
| 10 | Stablecoin Arbitrage Agent | Bounded authority (position limits, slippage) | ReputationOracle (trust for capital delegation) |
| 11 | Agent Task Marketplace | **Direct extension** of receipt-based verification | TaskVerifier (this IS the extension) |
| 12 | DAO Treasury Autopilot | Bounded authority (spending categories, approval thresholds) | TaskVerifier + ReputationOracle |
| 13 | MentoTrader Arena | Agent ranking + capital delegation trust | ReputationOracle (leaderboard) |
| 14 | Rent-a-Human | Human verification + task completion proof | KYCGateway + TaskVerifier |
| 15 | Agent KYC Gateway | **Direct extension** of isHumanBacked() | KYCGateway (this IS the extension) |
| 16 | AgentVault (Memory) | Complementary infra — composes with MEL | — (different layer) |
| 17 | Agent Mesh (Discovery) | Reputation-based discovery ranking | ReputationOracle (trust signals) |

**Score: 14/17 ideas need MandateExecutionLayer to function safely.**
