import { requestRegistration } from '@selfxyz/agent-sdk'
import QRCode from 'qrcode'

async function main() {
  console.log('=== Registering MandateAgent with Self Agent ID ===\n')
  console.log('Mode: linked (autonomous agent backed by human passport)')
  console.log('Network: testnet (Celo Sepolia)\n')

  const session = await requestRegistration({
    mode: 'linked',
    network: 'testnet',
    humanAddress: '0xf282FCCc0608147aB493e6a081d354646614b4F1',
    disclosures: { minimumAge: 18 },
    agentName: 'MandateAgent',
  })

  console.log(`Agent address: ${session.agentAddress}`)
  console.log(`Stage: ${session.stage}`)
  console.log(`Expires: ${session.expiresAt}\n`)

  // Generate QR code
  await QRCode.toFile('self-agent-qr.png', session.deepLink, { width: 600 })
  console.log('QR code saved to: self-agent-qr.png')
  console.log('Open it and scan with Self app.\n')

  console.log('After scanning, run:')
  console.log(`  npx tsx poll-registration.ts "${session.sessionToken}"\n`)

  console.log(`SESSION_TOKEN=${session.sessionToken.slice(0, 50)}...`)
  console.log(`AGENT_ADDRESS=${session.agentAddress}`)

  // Save session for polling
  const fs = await import('fs')
  fs.writeFileSync('self-session.json', JSON.stringify({
    sessionToken: session.sessionToken,
    agentAddress: session.agentAddress,
    expiresAt: session.expiresAt,
    deepLink: session.deepLink,
  }, null, 2))
  console.log('\nSession saved to self-session.json')
}

main().catch(console.error)
