# What is MandateExecutionLayer?

You hire a contractor to renovate your kitchen. You give them a budget, a list of what they can change, and a deadline. Now imagine the contractor works while you're asleep, you can't see what they're doing, and there's no paper trail.

**That's how AI agents work today.**

---

## The Problem: Agents Act, Nobody Checks

AI agents are starting to do real things on behalf of real people — spending money, sending messages, making decisions, interacting with other services. And they're getting better at it fast.

But here's the gap: **there's no way for anyone to verify that an agent only did what it was told to do.**

```
TODAY'S AI AGENTS

  You ──→ "Do this" ──→ Agent ──→ ??? ──→ "I did it"
                                   │
                              No receipts
                              No boundaries
                              No proof
                              Just trust me
```

Think of it like giving an employee a company credit card with no spending limit, no expense reports, and no way to check the statement. The employee says "I only bought office supplies." You have to take their word for it.

Now multiply that by thousands of agents, each acting autonomously, some spawning other agents to help — and nobody can verify any of it.

As agents get more capable, this trust gap becomes a real risk. Not just from bad actors — research shows that even well-designed AI systems can develop unexpected behaviors from within, without anyone attacking them. The problem isn't just "what if someone hacks my agent?" It's **"what if my agent does something weird on its own?"**

---

## Why Existing Approaches Fall Short

### API Keys and Permissions

**Analogy:** Giving someone your house key.

You can give them the key or not — but you can't say "you can use the kitchen but not the bedroom." API keys give all-or-nothing access. There's no way to say "you can send messages but not spend money" or "you can spend up to $50 but not $500." And there's no record of what they did with the key.

### Centralized Registries

**Analogy:** A phone book maintained by one company.

Your agent's identity lives in someone else's database. If that company goes down, changes the rules, or decides to delist your agent — you lose access. There's no portability, no independence, and no way to verify anything without trusting the registry operator.

### Trusted Execution Environments (TEEs)

**Analogy:** A locked room where the work happens.

TEEs guarantee that nobody tampered with the room itself — the walls are solid, the lock works. But they don't tell you **what instructions the worker was given** inside the room. The agent might be running exactly as programmed, but the program itself might have the wrong permissions, or the agent might be doing something the human never authorized.

```
                    CAN THE    CAN YOU     CAN YOU    CAN ANYONE
                    AGENT BE   SET LIMITS  SEE WHAT   VERIFY
                    VERIFIED?  ON ACTIONS? IT DID?    INDEPENDENTLY?
  ─────────────────────────────────────────────────────────────────
  API Keys          Kinda       No          No         No
  Registries        Yes         No          No         No
  Locked Rooms      Yes         No          No         No
  (TEEs)
  ─────────────────────────────────────────────────────────────────
  Mandate Layer     Yes         YES         YES        YES
```

---

## The MandateExecutionLayer Approach

MandateExecutionLayer solves this with five layers, each doing one specific job. Here's how it works — no jargon, just the logic:

```
  YOU (real person)
   │
   │  ① Prove you're real
   │     (privacy-preserving — like showing a passport
   │      to a notary who confirms "real person"
   │      without photocopying it)
   │
   │  ② Write down the rules
   │     ┌─────────────────────────────┐
   │     │ THE MANDATE                 │
   │     │  Can reply to customers     │
   │     │  Can escalate issues        │
   │     │  Cannot access finances     │
   │     │  Cannot delete anything     │
   │     │  Budget: $100/day           │
   │     │  Expires: March 31          │
   │     └─────────────────────────────┘
   │
   ▼
  YOUR AGENT
   │
   │  ③ Gets an ID card tied to YOUR rules
   │     (not a generic identity — one that says
   │      "I am authorized to do these specific things
   │       for this specific person")
   │
   │  ④ Before every action:
   │     "Am I allowed to do this?" → checks the mandate
   │     The check happens privately (details stay confidential)
   │     But the answer gets recorded publicly
   │
   │  ⑤ Every action gets a receipt
   │     ┌──────────────────────────────────┐
   │     │ RECEIPT #47                      │
   │     │ Action: Replied to customer      │
   │     │ Allowed? Yes                     │
   │     │ When: March 20, 2:14pm           │
   │     │ Permanent. Public. Verifiable.   │
   │     └──────────────────────────────────┘
   │
   ▼
  ANYONE can check the receipts and verify the full chain:
  this action → was taken under this mandate → authorized by this verified human
```

### The Five Layers, Simply:

1. **Prove you're real.** The person setting up the agent proves they're a real, unique human. This uses a privacy-preserving check — like showing a passport to a notary who confirms "yes, real person" without photocopying it. No iris scans, no biometric databases.

2. **Write down the rules.** The human writes a "mandate" — a specific list of what the agent can do, how much it can spend, and when the permission expires. This gets stored publicly where anyone can read it.

3. **Give the agent an ID card.** The agent gets a verifiable identity tied to this specific mandate. Not a generic ID — one that says "I am authorized to do *these specific things* for *this specific person*."

4. **Check before every action.** Before the agent does anything, it checks the mandate: "Am I allowed to do this?" The check happens privately (the details stay confidential) but the yes/no answer gets recorded publicly.

5. **Receipt everything.** Every action the agent takes — or is blocked from taking — gets a permanent, public receipt. Anyone can look at these receipts and verify the full chain: this action was taken, under this mandate, authorized by this verified human.

---

## A Concrete Example

Alice sets up an AI agent to manage her customer support inbox.

- **Alice proves she's real** — once, using a privacy-preserving identity check (her passport, not her retina).
- **Alice creates a mandate** — the agent can read emails, send replies, and escalate urgent issues. It CANNOT access financial systems, delete messages, or operate after March 31. Budget: $100/day.
- **The agent goes to work.**

```
ALICE'S AGENT — ONE DAY OF WORK

  9:00am  Reply to customer       ALLOWED     → Receipt #1
  9:15am  Reply to customer       ALLOWED     → Receipt #2
  10:30am Process a refund        BLOCKED     → Receipt #3 (not in mandate)
  11:00am Escalate to manager     ALLOWED     → Receipt #4
  2:00pm  Delete old emails       BLOCKED     → Receipt #5 (not in mandate)
  3:00pm  Reply to customer       ALLOWED     → Receipt #6

  END OF DAY: Alice (or anyone) checks receipts:
  → 4 actions executed (all within mandate)
  → 2 actions blocked (correctly prevented)
  → Full accountability. Zero trust required.
```

Alice didn't have to watch the agent all day. She didn't have to trust it. She can look at the receipts and see exactly what happened — and so can anyone else.

If Alice decides the agent should stop, she revokes the mandate. Immediately. The agent loses all authority, and any future action attempts are blocked and receipted.

---

## What Makes This Different

**Bounded, not binary.** Not "agent can do everything" or "agent can do nothing." Specific permissions, specific limits, specific expiry. Like giving the contractor a list of approved changes and a budget — not the keys to the whole house.

**Verifiable by anyone.** You don't have to trust the agent, the platform, or even the human. The receipts are public and permanent. Anyone can independently verify the full chain: receipt → mandate → verified human.

**Privacy where it matters.** The mandate details (what you authorized, how much) can stay private. The compliance reasoning happens privately. Only the proof of compliance — the receipt — goes public.

**Human kill switch.** The human can revoke the mandate at any time. The agent immediately loses authority. This isn't a "polite request to stop" — it's an onchain state change that the agent cannot override.

**Infrastructure, not an application.** MandateExecutionLayer is not a product for one use case. It's a layer that any agent system can plug into — customer support agents, trading agents, governance agents, payment agents. The mandate primitive is universal.

---

## Why This Matters Now

We're at the beginning of AI agents acting autonomously with real money and real consequences. The capability is moving fast. The trust infrastructure has not kept up.

Without bounded authority and receipts, the first major agent failure — an agent that overspends, leaks data, or acts outside its scope — will set back the entire space. Not because the technology is bad, but because there was no way to prove it was used correctly.

```
  1995: "I'll type my credit card into this website"
        → Nobody did, because there was no HTTPS
        → HTTPS arrived → e-commerce exploded

  2026: "I'll let this AI agent manage my money"
        → Nobody will, because there's no mandate verification
        → Mandate layer arrives → agent economy unlocks
```

MandateExecutionLayer is the accounting layer for the agent economy. Not the exciting part — but the part that makes everything else trustworthy.

The internet needed HTTPS before e-commerce could work. The agent economy needs mandate verification before autonomous agents can be trusted with real stakes.

---

*For technical details, see [README.md](README.md). For the full system flow, see [processflow.md](processflow.md). For the ideation journey and next-iteration architecture, see [IDEAS.md](IDEAS.md).*
