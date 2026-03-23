#!/usr/bin/env node
/**
 * MandateExecutionLayer MCP Server
 *
 * Exposes MEL's bounded-authority infrastructure as MCP tools that any
 * agent (e.g. Purple Hermes) can call before executing actions.
 *
 * Tools:
 *   check_compliance  — Dry-run: is this action allowed under the mandate?
 *   execute_action    — Full flow: check + execute + onchain receipt
 *   get_mandate       — Read mandate state from chain
 *   get_receipts      — Read action receipts from chain
 *
 * Transport: stdio (standard MCP)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

import { publicClient, MANDATE_REGISTRY_ADDRESS, MANDATE_REGISTRY_ABI, ACTION_RECEIPT_ADDRESS, ACTION_RECEIPT_ABI } from './src/config.js'
import { fetchMandate, localMandateCheck, hashAction } from './src/mandate.js'
import { checkCompliance } from './src/venice.js'
import { postReceipt, getReceipts } from './src/receipt.js'
import { executeAction } from './src/executor.js'
import { appendLog, getLogs, type LogEntry } from './src/logger.js'
import { verifyDelegation } from './src/delegation.js'
import { registerActionNames, executeWithMandate } from './src/index.js'
import { agentAccount } from './src/config.js'
import { keccak256, encodePacked } from 'viem'

// ─── Server Setup ────────────────────────────────────────────────────────────

const server = new McpServer({
  name: 'mel-mandate-server',
  version: '1.0.0',
})

// ─── Tool: check_compliance ──────────────────────────────────────────────────
// Dry-run compliance check — does NOT execute or post receipts.
// Purple Hermes should call this BEFORE every action.

server.tool(
  'check_compliance',
  'Check if a proposed action is allowed under a MEL mandate. Returns compliant/blocked with reasoning. Does NOT execute the action or post receipts — this is a dry-run check.',
  {
    mandateId: z.number().describe('The onchain mandate ID to check against'),
    actionType: z.string().describe('The action type to check (e.g. "send_message", "query_api", "transfer_funds")'),
    estimatedValue: z.number().optional().describe('Estimated ETH value of the action (default 0)'),
  },
  async ({ mandateId, actionType, estimatedValue }) => {
    try {
      const mandate = await fetchMandate(BigInt(mandateId))

      // Local pre-check
      const localCheck = localMandateCheck(
        mandate,
        actionType,
        BigInt(estimatedValue || 0)
      )

      // Venice AI compliance check
      const actionHash = hashAction(actionType)
      const allowedActionNames = mandate.allowedActions.map(a => a as string)

      const veniceDecision = await checkCompliance(
        {
          allowedActions: mandate.allowedActions.map(a => a as string),
          allowedActionNames,
          expiresAt: mandate.expiresAt,
          maxValuePerAction: mandate.maxValuePerAction,
          selfProofHash: mandate.selfProofHash,
          localCheckResult: {
            passed: localCheck.passed,
            reason: localCheck.reason,
          },
        },
        { type: actionType, params: {}, estimatedValue }
      )

      const result = {
        compliant: veniceDecision.compliant,
        reason: veniceDecision.reason,
        confidence: veniceDecision.confidence,
        localCheck: {
          passed: localCheck.passed,
          reason: localCheck.reason,
        },
        mandate: {
          id: mandateId,
          active: mandate.active,
          expiresAt: new Date(Number(mandate.expiresAt) * 1000).toISOString(),
          humanBacked: mandate.selfProofHash !== '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      }
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: String(error), compliant: false }, null, 2),
        }],
        isError: true,
      }
    }
  }
)

// ─── Tool: execute_action ────────────────────────────────────────────────────
// Full MEL flow: delegation check → mandate fetch → local check → Venice →
// execute (if compliant) → post onchain receipt → log

server.tool(
  'execute_action',
  'Execute an action through the full MEL compliance pipeline. Checks mandate, verifies with Venice AI, executes if compliant, and posts an onchain receipt. Both compliant and blocked actions are receipted.',
  {
    mandateId: z.number().describe('The onchain mandate ID'),
    actionType: z.string().describe('The action type (e.g. "send_message", "query_api")'),
    params: z.record(z.unknown()).optional().describe('Action parameters (e.g. { to: "user@example.com", body: "Hello" })'),
    estimatedValue: z.number().optional().describe('Estimated ETH value (default 0)'),
  },
  async ({ mandateId, actionType, params, estimatedValue }) => {
    try {
      // Register the action name so Venice can read it
      registerActionNames([actionType])

      const result = await executeWithMandate(
        BigInt(mandateId),
        {
          type: actionType,
          params: params || {},
          estimatedValue: estimatedValue || 0,
        }
      )

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            executed: result.executed,
            receiptTxHash: result.txHash,
            reason: result.reason,
            mandateId,
            actionType,
            onchainProof: result.txHash
              ? `https://sepolia.basescan.org/tx/${result.txHash}`
              : null,
          }, null, 2),
        }],
      }
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: String(error), executed: false }, null, 2),
        }],
        isError: true,
      }
    }
  }
)

// ─── Tool: get_mandate ───────────────────────────────────────────────────────
// Read mandate state from the onchain MandateRegistry

server.tool(
  'get_mandate',
  'Read a mandate from the onchain MandateRegistry contract on Base Sepolia. Returns the mandate owner, agent, allowed actions, expiry, value limits, and human-backed status.',
  {
    mandateId: z.number().describe('The mandate ID to query'),
  },
  async ({ mandateId }) => {
    try {
      const mandate = await fetchMandate(BigInt(mandateId))
      const zeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000'

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            id: mandateId,
            owner: mandate.owner,
            agent: mandate.agent,
            allowedActions: mandate.allowedActions,
            expiresAt: new Date(Number(mandate.expiresAt) * 1000).toISOString(),
            maxValuePerAction: mandate.maxValuePerAction.toString(),
            selfProofHash: mandate.selfProofHash,
            active: mandate.active,
            humanBacked: mandate.selfProofHash !== zeroHash,
            contract: MANDATE_REGISTRY_ADDRESS,
            chain: 'base-sepolia',
            explorer: `https://sepolia.basescan.org/address/${MANDATE_REGISTRY_ADDRESS}`,
          }, null, 2),
        }],
      }
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: String(error) }, null, 2),
        }],
        isError: true,
      }
    }
  }
)

// ─── Tool: get_receipts ──────────────────────────────────────────────────────
// Read action receipts from the onchain ActionReceipt contract

server.tool(
  'get_receipts',
  'Read all action receipts for a mandate from the onchain ActionReceipt contract. Each receipt shows the action hash, reasoning hash, compliance status, timestamp, and agent signature.',
  {
    mandateId: z.number().describe('The mandate ID to get receipts for'),
  },
  async ({ mandateId }) => {
    try {
      const receipts = await getReceipts(BigInt(mandateId))

      const formatted = receipts.map((r, i) => ({
        index: i,
        mandateId: Number(r.mandateId),
        actionHash: r.actionHash,
        reasoningHash: r.reasoningHash,
        compliant: r.compliant,
        timestamp: new Date(Number(r.timestamp) * 1000).toISOString(),
        agentSignature: r.agentSignature,
      }))

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            mandateId,
            totalReceipts: formatted.length,
            compliantCount: formatted.filter(r => r.compliant).length,
            blockedCount: formatted.filter(r => !r.compliant).length,
            receipts: formatted,
            contract: ACTION_RECEIPT_ADDRESS,
            chain: 'base-sepolia',
          }, null, 2),
        }],
      }
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: String(error) }, null, 2),
        }],
        isError: true,
      }
    }
  }
)

// ─── Tool: get_logs ──────────────────────────────────────────────────────────
// Read the local agent execution log

server.tool(
  'get_logs',
  'Read the local agent execution log (agent_log.json). Shows all actions attempted, compliance decisions, and receipt transaction hashes.',
  {
    mandateId: z.number().optional().describe('Filter logs to a specific mandate ID (optional — returns all if omitted)'),
    limit: z.number().optional().describe('Maximum number of log entries to return (default: all)'),
  },
  async ({ mandateId, limit }) => {
    try {
      let logs = getLogs()

      if (mandateId !== undefined) {
        logs = logs.filter(l => l.mandateId === mandateId)
      }

      if (limit !== undefined) {
        logs = logs.slice(-limit)
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            totalEntries: logs.length,
            logs,
          }, null, 2),
        }],
      }
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: String(error) }, null, 2),
        }],
        isError: true,
      }
    }
  }
)

// ─── Start Server ────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('MEL MCP Server running on stdio')
  console.error(`Agent: ${agentAccount.address}`)
  console.error(`MandateRegistry: ${MANDATE_REGISTRY_ADDRESS}`)
  console.error(`ActionReceipt: ${ACTION_RECEIPT_ADDRESS}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
