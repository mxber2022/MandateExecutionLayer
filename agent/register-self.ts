import { requestRegistration, SelfAgent } from '@selfxyz/agent-sdk'

async function main() {
  console.log('Registering agent with Self Agent ID...\n')
  console.log('Mode: linked (human-backed autonomous agent)')
  console.log('Network: testnet (Celo Sepolia)\n')

  const session = await requestRegistration({
    mode: 'linked',
    network: 'testnet',
    humanAddress: '0xf282FCCc0608147aB493e6a081d354646614b4F1',
    disclosures: { minimumAge: 18 },
    agentName: 'MandateAgent',
  })

  console.log('Registration session created:\n')
  console.log(`  Agent address: ${session.agentAddress}`)
  console.log(`  Stage: ${session.stage}`)
  console.log(`  Expires: ${session.expiresAt}`)
  console.log(`  Deep link: ${session.deepLink}`)
  console.log('\nInstructions:')
  session.humanInstructions.forEach((s: string) => console.log(`  - ${s}`))

  console.log('\n--- Save this session token to poll status ---')
  console.log(`SESSION_TOKEN=${session.sessionToken}`)
  console.log(`AGENT_ADDRESS=${session.agentAddress}`)

  // After registration completes, the agent can be used like:
  // const agent = new SelfAgent({ privateKey: exportedKey, network: 'testnet' })
  // const isRegistered = await agent.isRegistered()
  // const info = await agent.getInfo()
}

main().catch(console.error)
