import { parseArgs } from 'util'
import config from 'config'
import ky from 'ky'
import Server from '../core/server/server.js'

async function main() {
  const server = new Server(config.util.toObject())
  await server.start()
  const { iterations = '10000' } = parseArgs({
    options: { iterations: { type: 'string' } },
  }).values
  for (let i = 0; i < parseInt(iterations); ++i) {
    await ky(`${server.baseUrl}badge/coverage-${i}-green.svg`, {
      timeout: false,
    }).text()
  }
  await server.stop()
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
