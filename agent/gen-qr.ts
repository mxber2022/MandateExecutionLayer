import QRCode from 'qrcode'

const url = 'https://redirect.self.xyz?selfApp=%7B%22sessionId%22%3A%22e2341571-ec45-481e-acea-bf8fcfd9532b%22%2C%22userIdType%22%3A%22hex%22%2C%22devMode%22%3Afalse%2C%22endpointType%22%3A%22staging_celo%22%2C%22header%22%3A%22%22%2C%22logoBase64%22%3A%22https%3A%2F%2Fi.postimg.cc%2FmrmVf9hm%2Fself.png%22%2C%22deeplinkCallback%22%3A%22%22%2C%22disclosures%22%3A%7B%22minimumAge%22%3A18%7D%2C%22chainID%22%3A11142220%2C%22version%22%3A2%2C%22userDefinedData%22%3A%22K1637d932e503ecc8c88f384ebc67007fe4c86fd8197be68628480201e14b2b12920d719f60596d2a2103111f7373d043a4dd510720c955f8aad89de922fc052d7ec630e1a316351fc0be0da0f9e4a550c0bcd50171c%22%2C%22appName%22%3A%22Self%20Agent%20ID%22%2C%22scope%22%3A%22self-agent-id%22%2C%22endpoint%22%3A%220x043DaCac8b0771DD5b444bCC88f2f8BBDBEdd379%22%2C%22userId%22%3A%22f282fccc0608147ab493e6a081d354646614b4f1%22%7D'

async function main() {
  await QRCode.toFile('/Users/maharajababu/Documents/Projects/hackathon/self-qr.png', url, { width: 600 })
  console.log('QR code saved to self-qr.png — open it and scan with Self app')
}

main().catch(console.error)
