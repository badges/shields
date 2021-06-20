import config from 'config'
import got from 'got'
import minimist from 'minimist'
import Server from '../core/server/server.js'

async function main() {
  const server = new Server(config.util.toObject())
  await server.start()
  const args = minimist(process.argv)
  const iterations = parseInt(args.iterations) || 10000
  for (let i = 0; i < iterations; ++i) {
    await got(`${server.baseUrl}badge/coverage-${i}-green.svg`)
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
