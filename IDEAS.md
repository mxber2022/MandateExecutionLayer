# IDEAS & ARCHITECTURE

How we got here and where this goes next.

---

## The Thread — How We Got Here

```
IDEATION TIMELINE
──────────────────────────────────────────────────────────────────────────────
 Read emergent        World AgentKit      "Does verification     Celo hackathon      MandateExecutionLayer
 misalignment paper   announcement        cascade?"              Agent Repetition    = infrastructure
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

This was reinforced by **"Emergence in Multi-Agent Systems: A Safety Perspective"** (Altmann et al., August 2024), which showed that when two specification "blind spots" overlap in multi-agent systems, **cascading failures emerge WITHOUT external attack**. Individual agents can satisfy their local specs while the system as a whole fails.

**The insight that changed everything:** the threat model for autonomous agents is not just adversarial (prompt injection, manipulation). Even well-intentioned multi-agent systems can produce emergent "viruses" — cascading failures from within. You don't just need to defend against attacks. **You need to bound normal operation.**

This means any serious agent infrastructure must assume that agents can fail *from the inside* — not because they were attacked, but because emergent behavior is an intrinsic property of complex multi-agent systems.

### ② World AgentKit — The Proof-of-Humanity Question

On March 17, 2026, World Network (co-founded by Sam Altman) launched **AgentKit** — a developer toolkit that lets verified humans delegate their World ID to AI agents. The system uses zero-knowledge proofs so platforms can verify a real person backs an agent without collecting personal data.

This raised two immediate questions:

1. **Privacy**: World ID requires an iris scan (Orb). How do you prove the human behind an agent **without biometric registries**? Self Protocol's ZK passport (NFC-based, no biometrics, privacy-preserving) offers an alternative path — you prove you're a unique human without revealing who you are.

2. **Scope**: World AgentKit handles single-level delegation (human → agent). But what happens when that agent needs to spin up sub-agents?

### ③ The Cascading Verification Problem

This was the key insight that connected the dots:

> **If a human-backed agent spins up another agent, does the verification cascade?**

World AgentKit has **no documented support for sub-agent cascading**. The verification terminates at level 1. If Agent A (human-backed via World ID) creates Agent B to handle a subtask, Agent B has no provable connection to the original human. From the outside, Agent B is indistinguishable from a bot-spawned bot.

This is the gap. And it's not just a World ID problem — it's a structural problem for any identity system that only verifies the top level.

The problem framing was echoed in discussions around agent verification on X/Twitter, notably by @simplifyinai, who articulated the same concern: how do you maintain trust chains in multi-agent systems when agents spawn agents?

### ④ Celo Hackathon — Agent Repetition Oracle

On March 20, 2026, we discovered the Celo "Build Agents for the Real World" hackathon. Among the project ideas was the **Agent Repetition Oracle** — an onchain oracle that detects repetitive or anomalous agent behavior, acting as a safety monitor for runaway agents.

This was the same problem space from a different angle:

- **Agent Repetition Oracle** = *detect* bad behavior after it happens
- **MandateExecutionLayer** = *prevent* bad behavior at the authorization layer AND receipt everything

MandateExecutionLayer is a superset. The Agent Repetition Oracle becomes a **consumer** of MandateExecutionLayer data — it reads the `ActionReceipt` stream and flags anomalies, using the mandate context to determine whether a pattern is actually anomalous or just expected behavior within bounds.

### ⑤ From Use Case to Infrastructure Layer

The realization: this is not one application. It is a **primitive** that any agent system can plug into.

The five-layer architecture emerged from asking: "What is the minimum set of load-bearing layers for bounded agent authority?"

```
PERSONHOOD      → Self Protocol (ZK passport)         → "A real human authorized this"
DELEGATION      → MetaMask ERC-7715                    → "This agent is cryptographically authorized"
MANDATE         → MandateRegistry.sol                  → "These are the bounds"
REASONING       → Venice AI (private)                  → "This action is within bounds"
RECEIPT         → ActionReceipt.sol                    → "Here's the proof"
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
| 5 | Celo "Build Agents for the Real World" Hackathon | [Notion](https://celoplatform.notion.site/Hackathon-Project-Ideas-2fed5cb803de80b89a98ee8e87541b8c) | Agent Repetition Oracle as adjacent problem space — validated generalizability |
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

### Agent Repetition Oracle Integration

The Celo hackathon's "Agent Repetition Oracle" concept maps cleanly onto MandateExecutionLayer as a consumer:

```
ActionReceipt.sol                    Agent Repetition Oracle
─────────────────                    ───────────────────────
getReceipts(mandateId)  ──────→      Read receipt stream
                                     │
MandateRegistry.sol                  │ Compare against mandate
─────────────────────                │ context to determine if
getMandate(mandateId)   ──────→      │ pattern is anomalous
                                     │
                                     ▼
                                     Flag: "Agent B executed
                                     send_message 47 times in
                                     1 hour — mandate allows it,
                                     but pattern is unusual"
```

The oracle reads `ActionReceipt.getReceipts(mandateId)` for the action stream and `MandateRegistry.getMandate(mandateId)` for the authorization context. Without the mandate context, the oracle can only detect raw repetition. With it, the oracle can distinguish between:
- **Expected repetition** (a customer support agent sending many replies — within mandate)
- **Anomalous repetition** (an agent re-executing the same failed action in a loop — likely a bug)
- **Unauthorized patterns** (blocked actions being repeatedly attempted — possible compromise)

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
| Celo deployment | Planned | Deploy existing contracts on Celo testnet |
| Agent KYC Gateway interface | Planned | Build IVerificationProvider with Self + mock World ID |
| Repetition Oracle consumer | Planned | Read ActionReceipt stream and flag anomalies |
| Venice reasoning ZK proof | Research | Explore ZK proofs of LLM compliance reasoning |
