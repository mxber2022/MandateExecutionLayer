# 🛡️ What is MandateExecutionLayer?

<!-- PROJECT_METADATA
name: MandateExecutionLayer
type: non_technical_explainer
audience: [hackathon_judges, investors, non_technical_partners, agent_judges]
reading_time: 5_minutes
summary: MandateExecutionLayer is trust infrastructure for AI agents — it gives agents bounded authority with permanent receipts, so anyone can verify an agent only did what it was told.
keywords: [bounded_authority, agent_verification, onchain_receipts, trust_infrastructure, proof_of_humanity]
-->

You hire a contractor to renovate your kitchen. You give them a budget, a list of what they can change, and a deadline. Now imagine the contractor works while you're asleep, you can't see what they're doing, and there's no paper trail.

**That's how AI agents work today.**

---

## ⚠️ The Problem: Agents Act, Nobody Checks

AI agents are starting to do real things on behalf of real people — spending money, sending messages, making decisions, interacting with other services. And they're getting better at it fast.

But here's the gap: **there's no way for anyone to verify that an agent only did what it was told to do.**

```
🚨 TODAY'S AI AGENTS

  You ──→ "Do this" ──→ Agent ──→ ??? ──→ "I did it"
                                   │
                              ❌ No receipts
                              ❌ No boundaries
                              ❌ No proof
                              ❌ Just trust me
```

Think of it like giving an employee a company credit card with no spending limit, no expense reports, and no way to check the statement. The employee says "I only bought office supplies." You have to take their word for it.

Now multiply that by thousands of agents, each acting autonomously, some spawning other agents to help — and nobody can verify any of it.

As agents get more capable, this trust gap becomes a real risk. Not just from bad actors — research shows that even well-designed AI systems can develop unexpected behaviors from within, without anyone attacking them. The problem isn't just "what if someone hacks my agent?" It's **"what if my agent does something weird on its own?"**

---

## 🧩 Why Existing Approaches Fall Short

<!-- COMPARISON: existing_solutions -->
```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  🔑 API KEYS                                                        │
│  ────────                                                            │
│                                                                      │
│  Like giving someone your house key.                                 │
│                                                                      │
│  ┌─────────┐         ┌──────────────────────────┐                    │
│  │   KEY   │────────→│ FULL ACCESS TO EVERYTHING │                   │
│  └─────────┘         │ kitchen ✅  bedroom ✅     │                   │
│                      │ garage ✅   safe ✅         │                   │
│  You can't say       │ no limits, no log,        │                   │
│  "kitchen only"      │ no record of entry        │                   │
│                      └──────────────────────────┘                    │
│                                                                      │
│  🏢 CENTRALIZED REGISTRIES                                           │
│  ──────────────────────                                              │
│                                                                      │
│  Like a phone book maintained by one company.                        │
│                                                                      │
│  ┌──────────┐     ┌───────────┐                                      │
│  │ Registry │     │ Your agent│    Registry goes down?               │
│  │ Company  │──X──│ identity  │    Rules change?                     │
│  └──────────┘     └───────────┘    Agent delisted?                   │
│                                    You lose everything.              │
│  ❌ Single point of failure. No portability. No independence.        │
│                                                                      │
│  🔒 TRUSTED EXECUTION ENVIRONMENTS (TEEs)                            │
│  ─────────────────────────────────────                               │
│                                                                      │
│  Like a locked room where the work happens.                          │
│                                                                      │
│  ┌─── Locked Room (TEE) ────────────────────────────┐                │
│  │                                                   │                │
│  │  Walls: tamper-proof ✅                           │                │
│  │  Lock: working ✅                                 │                │
│  │  Code: unmodified ✅                              │                │
│  │                                                   │                │
│  │  Worker's instructions: ❓                        │                │
│  │  What worker is authorized to do: ❓              │                │
│  │  Record of what worker did: ❓                    │                │
│  │                                                   │                │
│  └───────────────────────────────────────────────────┘                │
│                                                                      │
│  The room is secure. But nobody checked the instructions.            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**📋 The scorecard:**

<!-- SCORECARD: solution_comparison -->
```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                 VERIFIED?  BOUNDED?  AUDITABLE?  INDEPENDENT?         │
│                 ─────────  ────────  ──────────  ────────────         │
│  🔑 API Keys    Kinda      ❌ No     ❌ No       ❌ No               │
│  🏢 Registries  ✅ Yes     ❌ No     ❌ No       ❌ No               │
│  🔒 TEEs        ✅ Yes     ❌ No     ❌ No       ❌ No               │
│                                                                      │
│  🛡️ Mandate     ✅ YES     ✅ YES    ✅ YES      ✅ YES              │
│     Layer                                                            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## ✅ The MandateExecutionLayer Approach

MandateExecutionLayer solves this with five layers, each doing one specific job. Here's how it works — no jargon, just the logic:

<!-- ARCHITECTURE: five_layer_flow -->
```
  👤 YOU (real person)
   │
   │  ① 🪪 Prove you're real
   │     (privacy-preserving — like showing a passport
   │      to a notary who confirms "real person"
   │      without photocopying it)
   │
   │  ② 📜 Write down the rules
   │     ┌─────────────────────────────┐
   │     │ THE MANDATE                 │
   │     │ ✅ Can reply to customers   │
   │     │ ✅ Can escalate issues      │
   │     │ ❌ Cannot access finances   │
   │     │ ❌ Cannot delete anything   │
   │     │ 💰 Budget: $100/day        │
   │     │ ⏰ Expires: March 31       │
   │     └─────────────────────────────┘
   │
   ▼
  🤖 YOUR AGENT
   │
   │  ③ 🪪 Gets an ID card tied to YOUR rules
   │     (not a generic identity — one that says
   │      "I am authorized to do these specific things
   │       for this specific person")
   │
   │  ④ 🔍 Before every action:
   │     "Am I allowed to do this?" → checks the mandate
   │     The check happens privately (details stay confidential)
   │     But the answer gets recorded publicly
   │
   │  ⑤ 🧾 Every action gets a receipt
   │     ┌──────────────────────────────────┐
   │     │ RECEIPT #47                      │
   │     │ Action: Replied to customer      │
   │     │ Allowed? ✅ Yes                  │
   │     │ When: March 20, 2:14pm          │
   │     │ 📌 Permanent. Public. Verifiable.│
   │     └──────────────────────────────────┘
   │
   ▼
  👀 ANYONE can check the receipts and verify the full chain:
  this action → was taken under this mandate → authorized by this verified human
```

### 📐 The Five Layers, Simply:

<!-- LAYERS_SUMMARY -->

1. **🪪 Prove you're real.** The person setting up the agent proves they're a real, unique human. This uses a privacy-preserving check — like showing a passport to a notary who confirms "yes, real person" without photocopying it. No iris scans, no biometric databases.

2. **📜 Write down the rules.** The human writes a "mandate" — a specific list of what the agent can do, how much it can spend, and when the permission expires. This gets stored publicly where anyone can read it.

3. **🪪 Give the agent an ID card.** The agent gets a verifiable identity tied to this specific mandate. Not a generic ID — one that says "I am authorized to do *these specific things* for *this specific person*."

4. **🔍 Check before every action.** Before the agent does anything, it checks the mandate: "Am I allowed to do this?" The check happens privately (the details stay confidential) but the yes/no answer gets recorded publicly.

5. **🧾 Receipt everything.** Every action the agent takes — or is blocked from taking — gets a permanent, public receipt. Anyone can look at these receipts and verify the full chain: this action was taken, under this mandate, authorized by this verified human.

---

## 📋 A Concrete Example

Alice sets up an AI agent to manage her customer support inbox.

- **🪪 Alice proves she's real** — once, using a privacy-preserving identity check (her passport, not her retina).
- **📜 Alice creates a mandate** — the agent can read emails, send replies, and escalate urgent issues. It CANNOT access financial systems, delete messages, or operate after March 31. Budget: $100/day.
- **🤖 The agent goes to work.**

<!-- EXAMPLE: alice_customer_support -->
```
🤖 ALICE'S AGENT — ONE DAY OF WORK

  9:00am  Reply to customer       ✅ ALLOWED     → 🧾 Receipt #1
  9:15am  Reply to customer       ✅ ALLOWED     → 🧾 Receipt #2
  10:30am Process a refund        ❌ BLOCKED     → 🧾 Receipt #3 (not in mandate)
  11:00am Escalate to manager     ✅ ALLOWED     → 🧾 Receipt #4
  2:00pm  Delete old emails       ❌ BLOCKED     → 🧾 Receipt #5 (not in mandate)
  3:00pm  Reply to customer       ✅ ALLOWED     → 🧾 Receipt #6

  📊 END OF DAY: Alice (or anyone) checks receipts:
  → 4 actions executed (all within mandate)
  → 2 actions blocked (correctly prevented)
  → Full accountability. Zero trust required.
```

Alice didn't have to watch the agent all day. She didn't have to trust it. She can look at the receipts and see exactly what happened — and so can anyone else.

If Alice decides the agent should stop, she revokes the mandate. Immediately. The agent loses all authority, and any future action attempts are blocked and receipted.

---

## 🏆 What Makes This Different

<!-- DIFFERENTIATORS -->
```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  📏 BOUNDED, NOT BINARY                                              │
│  ───────────────────                                                 │
│                                                                      │
│  Today's systems:     │    MandateExecutionLayer:                    │
│                       │                                              │
│  ┌──────────────┐     │    ┌──────────────────────────────────┐      │
│  │ ON     │ OFF │     │    │ Reply to customers    ✅         │      │
│  │        │     │     │    │ Escalate issues       ✅         │      │
│  │ Agent  │Agent│     │    │ Access finances       ❌         │      │
│  │ can do │can't│     │    │ Delete anything       ❌         │      │
│  │EVERY-  │do   │     │    │ 💰 Budget: $100/day             │      │
│  │THING   │ANY- │     │    │ ⏰ Expires: March 31            │      │
│  │        │THING│     │    └──────────────────────────────────┘      │
│  └──────────────┘     │    Specific. Granular. Time-limited.         │
│                       │                                              │
│  🔍 VERIFIABLE BY ANYONE                                             │
│  ────────────────────                                                │
│                                                                      │
│  You don't trust the agent. You don't trust the platform.            │
│  You don't even have to trust the human.                             │
│                                                                      │
│  🧾 Receipt → 📜 Mandate → 🪪 Proof of Humanity → 👤 Verified Human│
│                                                                      │
│  Anyone can walk the chain. Everything is public and permanent.      │
│                                                                      │
│  🔐 PRIVACY WHERE IT MATTERS                                        │
│  ────────────────────────                                            │
│                                                                      │
│  ┌─── 🔒 Private ────────────┐    ┌─── 🌐 Public ───────────────┐  │
│  │ Mandate details            │    │ Compliance receipts          │  │
│  │ Reasoning process          │    │ Yes/no answers               │  │
│  │ Identity information       │    │ Timestamps                   │  │
│  └────────────────────────────┘    └─────────────────────────────┘  │
│                                                                      │
│  🛑 HUMAN KILL SWITCH                                                │
│  ─────────────────                                                   │
│                                                                      │
│  Human calls revokeMandate() → agent loses ALL authority             │
│  Not a "polite request to stop."                                     │
│  An onchain state change the agent cannot override.                  │
│                                                                      │
│  🏗️ INFRASTRUCTURE, NOT AN APPLICATION                               │
│  ──────────────────────────────────                                  │
│                                                                      │
│  Customer support agents   ─┐                                        │
│  Trading agents            ─┤                                        │
│  Governance agents         ─┼──→  All plug into the same layer       │
│  Payment agents            ─┤                                        │
│  DAO treasury agents       ─┘                                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🌳 One Primitive, Many Products

MandateExecutionLayer isn't just one tool — it's the foundation that an entire ecosystem of agent products needs to exist.

Every time an agent action gets checked and receipted, it produces three signals at once:

<!-- ATOMIC_INSIGHT: three_signals_from_one_receipt -->
```
  Every receipted action simultaneously answers:
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  │  🪪 "Is this agent human-backed?"    → IDENTITY (KYC)│
  │                                                      │
  │  📊 "Does this agent follow rules?"  → REPUTATION    │
  │                                                      │
  │  ✅ "Did this agent complete the job?"→ VERIFICATION │
  │                                                      │
  └──────────────────────────────────────────────────────┘
```

This means three products naturally emerge from the same core:

<!-- EXTENSIONS: three_products -->
```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  🪪 AGENT KYC GATEWAY                                                │
│  ─────────────────                                                   │
│                                                                      │
│  Other agents or services ask:                                       │
│  "Is this agent backed by a real, verified human?"                   │
│                                                                      │
│  Service ──→ KYC Gateway ──→ reads mandate ──→ ✅ YES, human-backed  │
│                                                                      │
│  The mandate ALREADY contains the answer.                            │
│  The gateway just makes it queryable.                                │
│                                                                      │
│──────────────────────────────────────────────────────────────────────│
│                                                                      │
│  📊 AGENT REPUTATION SCORE                                           │
│  ──────────────────────                                              │
│                                                                      │
│  Every receipt is a data point.                                      │
│                                                                      │
│  Agent A: 500 actions, 98% compliance  →  🟢 HIGHLY TRUSTED         │
│  Agent B:  10 actions, 70% compliance  →  🟡 NEW, UNPROVEN          │
│  Agent C:  50 actions,  0% blocked     →  🟢 SPOTLESS RECORD        │
│                                                                      │
│  The receipts ALREADY contain the signal.                            │
│  The oracle just aggregates it into a score.                         │
│                                                                      │
│──────────────────────────────────────────────────────────────────────│
│                                                                      │
│  ✅ TASK VERIFICATION                                                │
│  ─────────────────                                                   │
│                                                                      │
│  When an agent is hired to do a job:                                 │
│                                                                      │
│  📜 Mandate says:   "Do tasks A, B, C within $50 by Friday"         │
│  🧾 Receipts show:  "A done ✅, B done ✅, C done ✅, under budget" │
│  ✅ Verifier says:  "Task completed properly → release payment"     │
│                                                                      │
│  The mandate ALREADY defines what "done" means.                      │
│  The receipts prove whether it happened.                             │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

<!-- USE_CASES: ecosystem_table -->
```
  🚀 WHAT THIS UNLOCKS:

  ┌────────────────────────────┬───────────────────────────────────┐
  │ Use Case                   │ Which signal it needs             │
  ├────────────────────────────┼───────────────────────────────────┤
  │ 🤝 Agent-to-agent hiring   │ Reputation > 95%                 │
  │ 💰 Capital delegation      │ Human-backed + high reputation   │
  │ 🏪 Automated marketplaces  │ Task verified → payment released │
  │ 🏛️ DAO treasury management │ All actions within bounds        │
  │ 💸 Cross-border payments   │ KYC-verified for corridor        │
  │ 🏆 Trading competitions    │ Reputation as leaderboard        │
  │ 👷 Freelancer platforms    │ Task verification + dispute      │
  └────────────────────────────┴───────────────────────────────────┘
```

One primitive. Three extensions. An entire economy of agent products built on top.

---

## 🔄 Why This Matters Now

We're at the beginning of AI agents acting autonomously with real money and real consequences. The capability is moving fast. The trust infrastructure has not kept up.

Without bounded authority and receipts, the first major agent failure — an agent that overspends, leaks data, or acts outside its scope — will set back the entire space. Not because the technology is bad, but because there was no way to prove it was used correctly.

<!-- ANALOGY: https_parallel -->
```
  📅 1995: "I'll type my credit card into this website"
           → ❌ Nobody did, because there was no HTTPS
           → 🔐 HTTPS arrived → 💥 e-commerce exploded

  📅 2026: "I'll let this AI agent manage my money"
           → ❌ Nobody will, because there's no mandate verification
           → 🛡️ Mandate layer arrives → 💥 agent economy unlocks
```

MandateExecutionLayer is the accounting layer for the agent economy. Not the exciting part — but the part that makes everything else trustworthy.

The internet needed HTTPS before e-commerce could work. The agent economy needs mandate verification before autonomous agents can be trusted with real stakes.

---

*For technical details, see [README.md](README.md). For the full system flow, see [processflow.md](processflow.md). For the ideation journey and next-iteration architecture, see [IDEAS.md](IDEAS.md).*
