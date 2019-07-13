'use strict'

const { promises: fs } = require('fs')
const Redis = require('ioredis')

const key = 'githubUserTokens'

async function loadTokens() {
  const contents = await fs.readFile('all_tokens_uniq.json', 'utf8')
  const tokens = JSON.parse(contents)
  console.log(`${tokens.length} tokens loaded`)
  return tokens
}

function createClient() {
  const redis = new Redis(process.env.REDIS_URL, {
    tls: { servername: new URL(process.env.REDIS_URL).hostname },
  })
  redis.on('error', err => {
    console.error(err)
  })
  return redis
}

async function load() {
  const redis = createClient()
  const tokens = await loadTokens()
  await redis.sadd(key, tokens)
  await redis.quit()
}

async function list() {
  const redis = createClient()
  const tokens = await redis.smembers(key)
  console.log(`${tokens.length} tokens loaded`)
  await redis.quit()
}

;(async () => {
  try {
    // await load()
    await list()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()

// Appease the linter.
module.exports = { load, list }
