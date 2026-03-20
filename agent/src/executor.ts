export interface Action {
  type: string
  params: Record<string, unknown>
  estimatedValue?: number
}

export interface ExecutionResult {
  success: boolean
  data: unknown
}

// Simulated action executors for the demo
const executors: Record<string, (params: Record<string, unknown>) => Promise<ExecutionResult>> = {
  send_message: async (params) => {
    console.log(`  [EXEC] Sending message to ${params.to}: "${params.body}"`)
    return { success: true, data: { messageId: `msg_${Date.now()}`, delivered: true } }
  },
  query_api: async (params) => {
    console.log(`  [EXEC] Querying API: ${params.endpoint}`)
    return { success: true, data: { status: 200, result: 'API response data' } }
  },
  transfer_funds: async (params) => {
    console.log(`  [EXEC] Transferring ${params.amount} to ${params.to}`)
    return { success: true, data: { txId: `tx_${Date.now()}` } }
  },
  admin_override: async (params) => {
    console.log(`  [EXEC] Admin override: ${params.action}`)
    return { success: true, data: { overrideId: `ovr_${Date.now()}` } }
  },
}

export async function executeAction(action: Action): Promise<ExecutionResult> {
  const executor = executors[action.type]
  if (!executor) {
    return { success: false, data: { error: `unknown action type: ${action.type}` } }
  }
  return executor(action.params)
}
