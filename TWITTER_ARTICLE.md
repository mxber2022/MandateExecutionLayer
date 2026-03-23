# The HTTPS of the Agent Economy

In 1995, nobody typed their credit card into a website. Not because e-commerce was a bad idea — but because there was no HTTPS.

In 2026, nobody will let an AI agent manage their money. Not because agent autonomy is a bad idea — but because there's no mandate verification.

Same problem. Same solution. The trust layer was missing.

We built it.

---

AI agents are starting to spend real money and make real decisions.

There's no way for anyone to verify they only did what they were told.

That's the gap. Not identity — identity is being solved. The gap is **action legitimacy**: proof that a verified agent acted within the scope its human authorized.

We built the primitive that fills it.

---

## The trust gap nobody talks about

Here's how every AI agent works today:

```
You ──→ "Do this" ──→ Agent ──→ ??? ──→ "Done."
                                 │
                            ❌ No boundaries
                            ❌ No verification
                            ❌ No receipts
                            ❌ No proof
```

You give your agent a task. It goes off and does... something. It comes back and says "I did it." You have to take its word for it.

That's like giving an employee a company credit card with no spending limit, no expense reports, and no way to check the statement.

Now multiply that by thousands of autonomous agents. Some spawning sub-agents. All acting on behalf of humans who can't watch them.

**And it's worse than you think.** The threat isn't just hackers.

Research from Betley et al. (Nature, 2026) shows that even well-designed AI systems develop unexpected behaviors from within — emergent misalignment. No one attacked them. The complexity itself produced failures nobody predicted.

The threat model is internal. And nothing in the current stack addresses it.

---

## Why existing solutions don't work

**API Keys** — "Here's a key to the whole house." All-or-nothing access. No boundaries. No audit trail. You can't say "kitchen only."

**Centralized Registries** — Your agent's identity lives in someone else's database. They go down, your agent loses its identity. Single point of failure.

**TEEs** — The room is locked and tamper-proof. Great. But who gave the worker their instructions? A locked room doesn't bound authorization.

**World / AgentKit** — "One human, one agent — verified." But if that agent spawns a sub-agent? The verification stops. No cascade. No proof of humanity flowing downstream.

The scorecard:

```
                VERIFIED?  BOUNDED?  AUDITABLE?  INDEPENDENT?
                ─────────  ────────  ──────────  ────────────
API Keys        Kinda      ❌        ❌          ❌
Registries      ✅         ❌        ❌          ❌
TEEs            ✅         ❌        ❌          ❌

Mandate Layer   ✅         ✅        ✅          ✅
```

Everyone is building identity. Nobody is building bounded authority with receipts.

---

## What Mandate Execution Layer does

One primitive. Three properties. Every agent action.

**Without MEL:**
```
Human: "Do stuff"
  ↓
Agent: does whatever
  ↓
Human: "What did you do?"
  ↓
Agent: "Trust me"
```

**With MEL:**
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

## The five layers

Each one is load-bearing. Remove any layer and the system breaks.

**Layer 1 — Personhood.** The human proves they're real using Self Protocol's ZK passport verification. Privacy-preserving — like showing a passport to a notary who confirms "real person" without photocopying it. No iris scans.

**Layer 2 — Mandate.** The human writes specific rules: what the agent can do, spending limits, expiry time. Stored onchain in `MandateRegistry.sol`. Anyone can read it.

**Layer 3 — Agent Identity.** The agent gets an ERC-8004 identity bound to this specific mandate. Not a generic ID — one that says "I am authorized to do *these specific things* for *this specific person*."

**Layer 4 — Private Reasoning.** Before every action, Venice AI evaluates compliance. Zero data retention. The reasoning is private, but the yes/no answer gets hashed and stored onchain.

**Layer 5 — Receipts.** Every action — executed or blocked — gets a permanent onchain receipt in `ActionReceipt.sol`. The receipt contains: what happened, whether it was allowed, the reasoning hash, and the mandate reference.

The trust chain:

```
receipt → mandate → Self proof → verified human
```

Walk the chain backwards from any receipt. You'll reach a verified human. Every time. Without trusting anyone.

---

## The atomic insight

Here's what most people miss: every receipted agent action simultaneously produces three signals.

```
🪪 "Is this agent human-backed?"     → IDENTITY (KYC)
📊 "Does this agent follow rules?"   → REPUTATION
✅ "Did this agent complete the job?" → VERIFICATION
```

These aren't three separate systems. They're three VIEWS of the same receipt stream.

One primitive → identity, reputation, and task verification as emergent properties.

Agent A has 500 actions, 98% compliance? That's a reputation score. You didn't build a reputation system — you built receipts, and reputation fell out of them.

---

## Live proof — this is not a whitepaper

We deployed on Base Sepolia. Ran a full demo. 7 real onchain transactions. Every single one verifiable.

**Contracts:**
- MandateRegistry: `0xA0F8E21B7DeafB489563B5428e42d26745c9EA52`
- ActionReceipt: `0xEcAe9d43d49d02D1ED926A7Dce25e85a9B047a43`

**Demo — Mandate #10:**

| Action | Result | Verify |
|--------|--------|--------|
| Mandate Created | 📜 CREATED | [tx](https://sepolia.basescan.org/tx/0x3c8efa6f8aa1f8770bc86ee68b0aeffa00fa25a9f0c65246e8d6690afc2b5828) |
| send_message | ✅ EXECUTED | [tx](https://sepolia.basescan.org/tx/0x682e35f3f479ead34de867098afc0781855efaae3959e5aae53dd32a3d28719c) |
| transfer_funds | 🛑 BLOCKED | [tx](https://sepolia.basescan.org/tx/0x6283bd9f49caff70890c44edfd44b7df0ccd935a9d3b8097422f67cda56264ae) |
| query_api | ✅ EXECUTED | [tx](https://sepolia.basescan.org/tx/0xd62eede386b5f538a125adfdeee2a0aa05f9fd43c2ca8ce86cd2c1ae82bbba53) |
| admin_override | 🛑 BLOCKED | [tx](https://sepolia.basescan.org/tx/0x89e2250032f11b6c484e8634a63d093dc093998cb07329cd64d0633d77fa02c2) |
| send_message (after revoke) | 🛑 BLOCKED | [tx](https://sepolia.basescan.org/tx/0xa66d43eecd4130ca60cfb9d0c29058d8eb17c876d878859f27cd7bb240417682) |
| Mandate Revoked | 🛑 REVOKED | [tx](https://sepolia.basescan.org/tx/0x90c02562edb9f43cd960f13536a781a94665ec3489ae5bf4699fd1e0c7ff7094) |

7 onchain transactions. 5 action receipts. Zero trust required.

The agent tried to transfer funds — blocked. Tried admin override — blocked. Human revoked the mandate — agent tried to send a message — blocked and receipted.

Every blocked action has a receipt too. That's the point. The audit trail is complete.

---

## The HTTPS parallel

In 1995, nobody typed their credit card into a website. Not because e-commerce was a bad idea — but because there was no HTTPS. No encryption. No proof the connection was secure.

HTTPS arrived. E-commerce exploded. $6.3 trillion by 2024.

In 2026, nobody will let an AI agent manage their money. Not because agent autonomy is a bad idea — but because there's no mandate verification. No proof the agent stayed in bounds.

The trust layer was missing. Now it's not.

---

## What's next

**NOW** — Core primitive deployed and demonstrated. MandateRegistry + ActionReceipt on Base Sepolia. Full demo with real transactions.

**NEXT** — Extension contracts: KYC Gateway (is this agent human-backed?), Reputation Oracle (can I trust this agent?), Task Verifier (was this job done right?). Celo deployment.

**THEN** — Full agent economy on Celo. Agent-hires-agent with reputation gating. Task marketplaces with mandate-bounded execution. DAO treasury autopilots with spending bounds. The infrastructure layer that makes all of it auditable.

---

## Verify it yourself

Don't trust us. Verify.

- **GitHub:** [github.com/mxber2022/MandateExecutionLayer](https://github.com/mxber2022/MandateExecutionLayer)
- **Video Demo:** [in repo](https://github.com/mxber2022/MandateExecutionLayer/blob/main/video/demo/mel-demo.mp4)
- **ERC-8004 Agent (Celo):** ID 247 on Celo Sepolia ([tx](https://sepolia.celoscan.io/tx/0x81b37e1494287a4e7a95361f8beabb41662521981052bbe1487f05ae77a82aee))
- **ERC-8004 Agent (Base):** ID 2906 on Base Sepolia ([tx](https://sepolia.basescan.org/tx/0x9f5b06ef0e18c08ebd4ae5ce4b16642eddca3079da9713c6a4877e838fe173cb))
- **Contracts:** Verified on CeloScan and BaseScan — read them yourself

Built with @VeniceAI (private reasoning), @selfxyz (personhood verification), on @base and @Celo.

Built at @synthesis_hacks and Celo Hackathon V2.

The accounting layer for the agent economy. Not the exciting part — but the part that makes everything else trustworthy.
