import { readFileSync } from 'fs'

const session = JSON.parse(readFileSync('self-session.json', 'utf-8'))
const SESSION_TOKEN = session.sessionToken

async function main() {
  console.log('=== Exporting Agent Key ===\n')

  // Try status with auth header
  const statusRes = await fetch('https://app.ai.self.xyz/api/agent/register/status', {
    headers: { 'Authorization': `Bearer ${SESSION_TOKEN}` },
  })
  console.log(`Status endpoint: ${statusRes.status}`)
  const statusText = await statusRes.text()
  if (statusText) console.log('Status:', statusText)

  // Try export with auth header
  console.log('\n--- Key export ---')
  const exportRes = await fetch('https://app.ai.self.xyz/api/agent/register/export', {
    headers: { 'Authorization': `Bearer ${SESSION_TOKEN}` },
  })
  console.log(`Export endpoint: ${exportRes.status}`)
  const exportText = await exportRes.text()
  if (exportText) {
    try {
      const data = JSON.parse(exportText)
      console.log('Exported:', JSON.stringify(data, null, 2))
      if (data.privateKey) {
        console.log('\n=== AGENT PRIVATE KEY ===')
        console.log(data.privateKey)
        console.log('=== SAVE THIS ===')
      }
    } catch {
      console.log('Response:', exportText)
    }
  }
}

main().catch(console.error)
