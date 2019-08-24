'use strict'

const config = require('config').util.toObject()
console.log(config)
const GithubConstellation = require('../services/github/github-constellation')

const { persistence } = new GithubConstellation({
  persistence: config.public.persistence,
  service: config.public.services.github,
  private: config.private,
})

async function main() {
  const tokens = await persistence.initialize()
  console.log(`${tokens.length} tokens loaded`)
  await persistence.stop()
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
