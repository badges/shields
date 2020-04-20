'use strict'

const config = require('config').util.toObject()
const got = require('got')
const minimist = require('minimist')
const Server = require('../core/server/server')

async function main() {
  const server = new Server(config)
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
