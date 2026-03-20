import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOG_PATH = join(__dirname, '..', 'agent_log.json')

export interface LogEntry {
  timestamp: string
  mandateId: number
  proposedAction: {
    type: string
    params: Record<string, unknown>
  }
  localCheck: string
  veniceDecision: {
    compliant: boolean
    reason: string
    confidence: number
  } | null
  executed: boolean
  receiptTxHash: string | null
  blockNumber?: number
}

function readLog(): { logs: LogEntry[] } {
  try {
    return JSON.parse(readFileSync(LOG_PATH, 'utf-8'))
  } catch {
    return { logs: [] }
  }
}

export function appendLog(entry: LogEntry): void {
  const log = readLog()
  log.logs.push(entry)
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2))
}

export function getLogs(): LogEntry[] {
  return readLog().logs
}
