/**
 * Register MandateAgent on ERC-8004 Identity Registry
 *
 * Registers the agent on the official ERC-8004 registry on Celo.
 * The registry contract is deployed at the same address on 30+ chains via CREATE2.
 *
 * Usage:
 *   npx tsx register-erc8004.ts [--chain celo|celo-testnet|base|base-testnet]
 */

import { createWalletClient, createPublicClient, http, parseAbi, type Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { celo, celoAlfajores, base, baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();

// ─── ERC-8004 Registry Addresses (same on all chains via CREATE2) ───
const MAINNET_IDENTITY_REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432' as const;
const TESTNET_IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const;

// ─── ERC-8004 Identity Registry ABI (minimal for registration) ───
const IDENTITY_REGISTRY_ABI = parseAbi([
  'function register(string agentURI) external returns (uint256 agentId)',
  'function register() external returns (uint256 agentId)',
  'function setAgentURI(uint256 agentId, string newURI) external',
  'function agentURI(uint256 agentId) external view returns (string)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
]);

// ─── Chain Configuration ───
type ChainOption = 'celo' | 'celo-testnet' | 'base' | 'base-testnet';

function getChainConfig(chainOpt: ChainOption): { chain: Chain; registry: `0x${string}`; rpcUrl: string } {
  switch (chainOpt) {
    case 'celo':
      return {
        chain: celo,
        registry: MAINNET_IDENTITY_REGISTRY,
        rpcUrl: 'https://forno.celo.org',
      };
    case 'celo-testnet':
      return {
        chain: celoAlfajores,
        registry: TESTNET_IDENTITY_REGISTRY,
        rpcUrl: 'https://alfajores-forno.celo-testnet.org',
      };
    case 'base':
      return {
        chain: base,
        registry: MAINNET_IDENTITY_REGISTRY,
        rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      };
    case 'base-testnet':
      return {
        chain: baseSepolia,
        registry: TESTNET_IDENTITY_REGISTRY,
        rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      };
  }
}

async function main() {
  // Parse chain argument
  const chainArg = process.argv.find(a => a.startsWith('--chain='))?.split('=')[1]
    || process.argv[process.argv.indexOf('--chain') + 1]
    || 'celo-testnet';

  const chainOpt = chainArg as ChainOption;
  const { chain, registry, rpcUrl } = getChainConfig(chainOpt);

  console.log(`\n🔗 Chain: ${chain.name} (${chain.id})`);
  console.log(`📋 Registry: ${registry}`);

  // ─── Setup wallet ───
  const privateKey = process.env.HUMAN_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ HUMAN_PRIVATE_KEY not set in .env');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  console.log(`👤 Registering from: ${account.address}`);

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

  // ─── Check balance ───
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Balance: ${(Number(balance) / 1e18).toFixed(6)} ${chain.nativeCurrency.symbol}`);

  if (balance === 0n) {
    console.error(`❌ No ${chain.nativeCurrency.symbol} balance. Need gas to register.`);
    if (chainOpt === 'celo-testnet') {
      console.log('💡 Get testnet CELO from: https://faucet.celo.org/alfajores');
    }
    process.exit(1);
  }

  // ─── Agent URI ───
  // Use GitHub raw URL for the registration JSON
  const agentURI = 'https://raw.githubusercontent.com/mxber2022/MandateExecutionLayer/main/agent/erc8004-registration.json';
  console.log(`📄 Agent URI: ${agentURI}`);

  // ─── Check if already registered ───
  const existingBalance = await publicClient.readContract({
    address: registry,
    abi: IDENTITY_REGISTRY_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });

  if (existingBalance > 0n) {
    console.log(`⚠️  This address already has ${existingBalance} agent(s) registered.`);
    console.log('   Proceeding to register another...');
  }

  // ─── Register ───
  console.log('\n🚀 Registering agent on ERC-8004 Identity Registry...\n');

  try {
    const hash = await walletClient.writeContract({
      address: registry,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: 'register',
      args: [agentURI],
    });

    console.log(`📝 Transaction submitted: ${hash}`);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`✅ Confirmed in block ${receipt.blockNumber}`);

    // Extract agentId from Transfer event
    const transferLog = receipt.logs.find(log => {
      try {
        return log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'; // Transfer event
      } catch { return false; }
    });

    if (transferLog && transferLog.topics[3]) {
      const agentId = BigInt(transferLog.topics[3]);
      console.log(`\n🎉 Agent registered successfully!`);
      console.log(`   Agent ID: ${agentId}`);
      console.log(`   Chain: ${chain.name}`);
      console.log(`   Registry: ${registry}`);
      console.log(`   TX: ${getExplorerUrl(chain, hash)}`);
      console.log(`   Agentscan: https://agentscan.info/agents/${agentId}`);

      // Update the registrations field
      console.log(`\n📋 Update erc8004-registration.json "registrations" field with:`);
      console.log(JSON.stringify({
        agentRegistry: registry,
        agentId: agentId.toString(),
        chain: chain.name,
        chainId: chain.id
      }, null, 2));
    } else {
      console.log(`✅ Transaction confirmed but could not extract agentId from logs.`);
      console.log(`   Check the explorer: ${getExplorerUrl(chain, hash)}`);
    }
  } catch (err: any) {
    console.error('❌ Registration failed:', err.message || err);
    if (err.message?.includes('insufficient funds')) {
      console.log(`💡 Need more ${chain.nativeCurrency.symbol} for gas.`);
    }
    process.exit(1);
  }
}

function getExplorerUrl(chain: Chain, hash: string): string {
  const explorers: Record<number, string> = {
    42220: `https://celoscan.io/tx/${hash}`,
    44787: `https://alfajores.celoscan.io/tx/${hash}`,
    8453: `https://basescan.org/tx/${hash}`,
    84532: `https://sepolia.basescan.org/tx/${hash}`,
  };
  return explorers[chain.id] || hash;
}

main().catch(console.error);
