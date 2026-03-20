import { getAgentInfo } from '@selfxyz/agent-sdk'

const SESSION_TOKEN = 'i37yI3MzJChCJXGKAkKV5v__cnI3k3bY9Q0x70bRES_3U8Qncw9eixfYU0HAxsMXKEJtDqqjwcmHQ077ShHi7R4p6RuOORTUeS4HUnBPGAKqzXdlfXFHV_PHORXXtR3-2lbSTAUPguiav4YSzxHW4sbpbkDfxa2CE0yAaBJoP3Rf8ik-peT4HiG2Ad8XloWkBWXT9xfW86EGPKkuENAhoRMdV7dpT-urr88Bq_76qj34mqDOGdlIZfghyaU6CZm1eTE9w8Am8cJUt_ZjNNw3NNveRFcr0gM14dUSwKeXKgzZje7nR_8F1CiqsUMuXSeKF5UiTqJ84uiW490qZhxNweVUyZkTzlJkVVKYK-IeDbPuTW5tJlNQry2QzTFNsEryhE0H-clq7Bi6qtIXCnOiTyu0hIJMZbn4mapjiJnlWEaFg0tRqc5ncLZPaHbDzpAKbCyOk3cx-gbVyinzB2qr2XDGrRrT5Rjs3lRhV1o2sN-BM8lKhOAR_0Xtc83I5Ts9PKZtOVaGmNN3INFm41ZsnY6_Mxs9qzIGObinH5yAj_bwqey_V9Mo1nDronfPmYTbAhppTvlMYUwSjSE0K13SQ72gzznpN-kxRzwuRiRdwtqJm91GfYZUSQlJxghVCwMok5Ghgs8b-UKC8G0xcF2f8Q7RS7pZTyW5vSUiE3qYoK2LSEWSzagKhIkIEkgX3uZpGMKHri-YdnTdV7zdctghvPkZ3kBhSSAq9Z6Gk4_c9H1822q5wx18i3EH5LLPjnt95NVCDS_4gRCLbIDZ5qcX1Dz0Fqusi_e2iQVoP2dSUBjWZaTvWavcYVhLiD3A7IBWfAETMdvbyYc5mxhOJ9angI6HHpA7UwJ6Xqh5BmziU1jvcaRjqdcboVWNGhAsyPsbHJjDgPz3eVlAgFm-vNuIn3lzFJxJFb9jqVKYRIed2-4AYmraNITtcr28Yao5cLvqgVefwNK1_wEyzHat8lUJoolm1ENHYgJ_9bOCbfvVM0PWMiUMzMj18V3DMEgxapBqTWRsBFwqcqzMzwADFrTOy0eWkZnWLDHoTeQN_JU2zfLia7_Bd5io_Lg7-WnvUVL5Vm2y8LNy9F0ikWyC1Tuwy07vQAv3--LqS8GaqPsBgmB18LnvCLcxDYelzdkCp0u-jjlQTOlsAa5LYR9kq45HoJoZEM4gs4lv_vVudtDTG-5TEKfPes4_4toa_NBdIJsAX5vMntktnD4dZOTRV5oYvDMwZPv0AR06h-AOm4EkT7JrojIXOxxB37H1EBlEDV_F8CL7I1UsRvU-e6Apl5CIbcNerodFsNGmzTbFBY18wmO2UOF_EDSgePELzVnMI74wUy-B7NJp7Vp8Jo4RkIkwB2sipnDRkiQhZ693GH9nQfD-d4oQOywapF5O7MGs9EaAQCMl9XmDuZCaa62PwBWiug'
const AGENT_ADDRESS = '0x3741C81Fe2B5d4cc8317908BC2862E333f75Ec93'

async function main() {
  console.log('Polling Self Agent ID registration status...\n')
  console.log(`Agent address: ${AGENT_ADDRESS}`)

  // Poll registration status
  const statusUrl = `https://selfagentid.xyz/api/agent/register/status`

  for (let i = 0; i < 60; i++) {
    const res = await fetch(statusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SESSION_TOKEN}`,
      },
      body: JSON.stringify({ sessionToken: SESSION_TOKEN }),
    })

    const data = await res.json()
    console.log(`[${new Date().toISOString()}] Status:`, JSON.stringify(data))

    if (data.stage === 'complete' || data.stage === 'registered') {
      console.log('\n✓ Registration complete!')
      console.log('Agent NFT minted on Celo Sepolia')

      // Also try to get agent info
      try {
        const info = await getAgentInfo({
          agentAddress: AGENT_ADDRESS,
          network: 'testnet'
        })
        console.log('Agent info:', JSON.stringify(info, null, 2))
      } catch (e) {
        console.log('Agent info not available yet')
      }
      return
    }

    if (data.stage === 'failed' || data.error) {
      console.log('\n✗ Registration failed:', data.error || data)
      return
    }

    // Wait 5 seconds
    await new Promise(r => setTimeout(r, 5000))
  }

  console.log('\nTimeout — registration not completed within 5 minutes')
}

main().catch(console.error)
