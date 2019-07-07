'use strict'

const { promises: fs } = require('fs')
const { promisify } = require('util')
const redis = require('redis')

const key = 'githubUserTokens'

async function loadTokens() {
  const contents = await fs.readFile('all_tokens_uniq.json', 'utf8')
  const tokens = JSON.parse(contents)
  console.log(`${tokens.length} tokens loaded`)
  return tokens
}

function createClient() {
  const client = redis.createClient(process.env.REDIS_URL, {
    tls: { servername: new URL(process.env.REDIS_URL).hostname },
  })
  client.on('error', err => {
    console.error(err)
  })
  return client
}

// eslint-disable-next-line no-unused-vars
async function load() {
  const client = createClient()

  const tokens = await loadTokens()

  const sadd = promisify(client.sadd).bind(client)
  await sadd(key, tokens)

  await promisify(client.quit).bind(client)()
}

async function list() {
  const client = createClient()

  const smembers = promisify(client.smembers).bind(client)

  const tokens = await smembers(key)
  console.log(`${tokens.length} tokens loaded`)

  await promisify(client.quit).bind(client)()
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
