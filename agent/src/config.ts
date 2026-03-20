import dotenv from 'dotenv'
import { createPublicClient, createWalletClient, http, type Chain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

dotenv.config()

function env(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env: ${key}`)
  return val
}

function envKey(key: string): `0x${string}` {
  const val = env(key)
  return (val.startsWith('0x') ? val : `0x${val}`) as `0x${string}`
}

export const VENICE_API_KEY = env('VENICE_API_KEY')
export const MANDATE_REGISTRY_ADDRESS = env('MANDATE_REGISTRY_ADDRESS') as `0x${string}`
export const ACTION_RECEIPT_ADDRESS = env('ACTION_RECEIPT_ADDRESS') as `0x${string}`
export const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'

export const agentAccount = privateKeyToAccount(envKey('AGENT_PRIVATE_KEY'))
export const humanAccount = privateKeyToAccount(envKey('HUMAN_PRIVATE_KEY'))

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC),
})

export const agentWalletClient = createWalletClient({
  account: agentAccount,
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC),
})

export const humanWalletClient = createWalletClient({
  account: humanAccount,
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC),
})

export const MANDATE_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'createMandate',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'allowedActions', type: 'bytes32[]' },
      { name: 'expiresAt', type: 'uint256' },
      { name: 'maxValuePerAction', type: 'uint256' },
      { name: 'selfProofHash', type: 'bytes32' },
    ],
    outputs: [{ name: 'mandateId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getMandate',
    inputs: [{ name: 'mandateId', type: 'uint256' }],
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'agent', type: 'address' },
      { name: 'allowedActions', type: 'bytes32[]' },
      { name: 'expiresAt', type: 'uint256' },
      { name: 'maxValuePerAction', type: 'uint256' },
      { name: 'selfProofHash', type: 'bytes32' },
      { name: 'active', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isActionAllowed',
    inputs: [
      { name: 'mandateId', type: 'uint256' },
      { name: 'actionHash', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isMandateActive',
    inputs: [{ name: 'mandateId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isHumanBacked',
    inputs: [{ name: 'mandateId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'revokeMandate',
    inputs: [{ name: 'mandateId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'nextMandateId',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

export const ACTION_RECEIPT_ABI = [
  {
    type: 'function',
    name: 'postReceipt',
    inputs: [
      { name: 'mandateId', type: 'uint256' },
      { name: 'actionHash', type: 'bytes32' },
      { name: 'reasoningHash', type: 'bytes32' },
      { name: 'compliant', type: 'bool' },
      { name: 'agentSignature', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getReceipts',
    inputs: [{ name: 'mandateId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'mandateId', type: 'uint256' },
          { name: 'actionHash', type: 'bytes32' },
          { name: 'reasoningHash', type: 'bytes32' },
          { name: 'compliant', type: 'bool' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'agentSignature', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getReceiptCount',
    inputs: [{ name: 'mandateId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const
