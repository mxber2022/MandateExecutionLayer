# MandateExecutionLayer — Thesis

## We're building the HTTPS of the agent economy.

```
══════════════════════════════════════════════════════════════════════════

  THE PROBLEM
  ───────────

  AI agents are starting to spend real money and make real decisions.
  There's no way for anyone to verify they only did what they were told.

══════════════════════════════════════════════════════════════════════════
```

### The trust gap

```
  TODAY

  Human ──→ "Send $50" ──→ Agent ──→ ??? ──→ "Done."

                                      │
                                 No boundaries
                                 No verification
                                 No receipts
                                 No proof

  You have to take the agent's word for it.
```

### It's worse than you think

Agents don't just fail because someone hacks them. **They fail from the inside.**

```
  EXTERNAL THREATS              INTERNAL THREATS
  (what people worry about)     (what actually kills you)
  ─────────────────────         ────────────────────────
  Prompt injection              Emergent misalignment ¹
  Data poisoning                Cascading multi-agent failures ²
  Adversarial attacks           Specification blind spots ²
                                Goal drift in autonomous systems ³

  ¹ Betley et al., "Emergent Misalignment", Nature 2026
  ² Altmann et al., "Emergence in Multi-Agent Systems", 2024
  ³ "The Coming Crisis of Multi-Agent Misalignment", 2025
```

Even well-intentioned agents, running correct code, can produce behaviors nobody predicted. The threat model isn't just adversarial. **The threat is complexity itself.**

---

### What exists today doesn't solve it

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │  API KEYS          "Here's a key to the whole house"            │
  │  ─────────         All-or-nothing access                        │
  │                    No boundaries. No audit trail.               │
  │                                                                 │
  │  CENTRALIZED       "Your identity lives in our database"        │
  │  REGISTRIES        We go down, your agent loses its identity.   │
  │  ──────────        Single point of failure.                     │
  │                                                                 │
  │  TEEs              "The room is locked and tamper-proof"         │
  │  ────              But who gave the worker their instructions?  │
  │                    A locked room doesn't bound authorization.   │
  │                                                                 │
  │  WORLD             "One human, one agent — verified"            │
  │  AGENTKIT          But if that agent spawns a sub-agent?        │
  │  ─────────         The verification stops. No cascade.          │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘

  THE GAP NOBODY IS FILLING:

  Human ──→ Agent A (verified) ──→ Agent B (???) ──→ Agent C (???)

  Does the proof of humanity cascade?
  Today: NO. Nowhere. Not in any system.
```

---

### What MandateExecutionLayer does

One primitive. Three properties. Every agent action.

```
  ┌───────────────────────────────────────────────────────────────────┐
  │                                                                   │
  │  WITH MANDATEEXECUTIONLAYER                                       │
  │                                                                   │
  │  Human ──→ Creates mandate ──→ Agent ──→ Checks mandate ──→ Acts  │
  │              │                              │                │    │
  │              │                              │                │    │
  │         ┌────┴────────┐              ┌──────┴──────┐   ┌────┴──┐ │
  │         │ BOUNDED     │              │ VERIFIED    │   │RECEIPT│ │
  │         │             │              │             │   │ED     │ │
  │         │ Human wrote │              │ Every action│   │Perman-│ │
  │         │ exactly what│              │ checked     │   │ent    │ │
  │         │ is allowed, │              │ BEFORE      │   │public │ │
  │         │ how much,   │              │ execution   │   │onchain│ │
  │         │ and when    │              │             │   │proof  │ │
  │         │ it expires  │              │ Private     │   │       │ │
  │         │             │              │ reasoning,  │   │Anyone │ │
  │         │ Kill switch │              │ public      │   │can    │ │
  │         │ at any time │              │ answer      │   │verify │ │
  │         └─────────────┘              └─────────────┘   └───────┘ │
  │                                                                   │
  └───────────────────────────────────────────────────────────────────┘
```

---

### The atomic insight

**Action-level verification is the atomic unit from which everything else derives.**

```
  Every receipted agent action simultaneously produces:

  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │  IDENTITY SIGNAL                                                │
  │  ───────────────                                                │
  │  "A verified human authorized this agent"                       │
  │                                                    → AGENT KYC  │
  │                                                                 │
  │  BEHAVIOR SIGNAL                                                │
  │  ───────────────                                                │
  │  "This agent has followed its mandate 498 out of 500 times"     │
  │                                                → REPUTATION     │
  │                                                                 │
  │  COMPLETION SIGNAL                                              │
  │  ─────────────────                                              │
  │  "All required actions for this task were completed in bounds"   │
  │                                          → TASK VERIFICATION    │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘

  These aren't three separate systems.
  They're three VIEWS of the same receipt stream.
```

---

### One primitive, entire ecosystem

```
                         MandateExecutionLayer
                         ─────────────────────
                         MandateRegistry.sol
                         ActionReceipt.sol
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
         ┌────────────┐  ┌────────────┐  ┌────────────┐
         │ KYC        │  │ REPUTATION │  │ TASK       │
         │ GATEWAY    │  │ ORACLE     │  │ VERIFIER   │
         │            │  │            │  │            │
         │ "Is this   │  │ "Can I     │  │ "Was this  │
         │  agent     │  │  trust     │  │  job done  │
         │  real?"    │  │  this      │  │  right?"   │
         │            │  │  agent?"   │  │            │
         └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
               │               │               │
               ▼               ▼               ▼
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  WHAT THIS UNLOCKS                                       │
  │                                                          │
  │  Remittance agents         (need KYC for compliance)     │
  │  FX hedging agents         (need bounded authority)      │
  │  DAO treasury autopilots   (need spending bounds)        │
  │  Freelancer platforms      (need task verification)      │
  │  Agent task marketplaces   (need all three)              │
  │  Trading agent arenas      (need reputation for ranking) │
  │  Agent discovery networks  (need trust for discovery)    │
  │  Agent-hires-human markets (need identity + completion)  │
  │  Savings agents            (need investment bounds)      │
  │  No-code agent launchers   (need mandate as config)      │
  │                                                          │
  │  14 out of 17 hackathon project ideas                    │
  │  need this layer to function safely.                     │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

---

### The parallel

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │  1995                              2026                         │
  │  ────                              ────                         │
  │                                                                 │
  │  "Type my credit card             "Let an AI agent              │
  │   into a website?"                 manage my money?"            │
  │                                                                 │
  │  No one did.                       No one will.                 │
  │                                                                 │
  │  There was no HTTPS.               There's no mandate           │
  │  No encryption.                    verification.                │
  │  No proof the connection           No proof the agent           │
  │  was secure.                       stayed in bounds.            │
  │                                                                 │
  │         ┌─────────────┐                   ┌─────────────┐       │
  │         │   HTTPS     │                   │  MANDATE    │       │
  │         │   arrived   │                   │  EXECUTION  │       │
  │         │             │                   │  LAYER      │       │
  │         └──────┬──────┘                   └──────┬──────┘       │
  │                │                                 │              │
  │                ▼                                 ▼              │
  │                                                                 │
  │  E-commerce exploded.              Agent economy unlocks.       │
  │  $6.3 trillion by 2024.           The trust layer was missing.  │
  │                                    Now it's not.                │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘
```

---

### What makes this real (not vaporware)

```
  DEPLOYED AND DEMONSTRATED
  ─────────────────────────

  2 smart contracts          → Base Sepolia, verified
  5-layer agent runtime      → TypeScript, working
  7 onchain transactions     → Real demo, real receipts
  5 scenarios tested         → Allowed, blocked, revoked — all receipted

  MandateRegistry:  0xA0F8E21B7DeafB489563B5428e42d26745c9EA52
  ActionReceipt:    0xEcAe9d43d49d02D1ED926A7Dce25e85a9B047a43

  This is not a whitepaper. The primitive works today.
```

---

### The roadmap

```
  NOW                    NEXT                     THEN
  ───                    ────                     ────
  Core primitive         Extension contracts      Full agent economy
  (deployed, working)    (KYC, Reputation,        on Celo
                          Task Verification)

  ┌─────────────┐       ┌──────────────────┐     ┌──────────────────┐
  │Mandate      │       │KYCGateway.sol    │     │Agent-hires-Agent │
  │Registry.sol │──────→│ReputationOracle  │────→│demo on Celo      │
  │Action       │       │.sol              │     │                  │
  │Receipt.sol  │       │TaskVerifier.sol  │     │Full ecosystem:   │
  │             │       │                  │     │task post → bid → │
  │Base Sepolia │       │+ Celo deployment │     │verify → pay cUSD │
  └─────────────┘       └──────────────────┘     └──────────────────┘

  Cascading mandates     Agent KYC Gateway        Agent Mesh
  (sub-agent             (identity-agnostic)      integration
   verification)
```

---

*For the full ideation journey and architecture: [IDEAS.md](IDEAS.md)*
*For the non-technical explainer: [EXPLAINER.md](EXPLAINER.md)*
*For technical implementation: [README.md](README.md)*
*For the 5-layer system flow: [processflow.md](processflow.md)*
