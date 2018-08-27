'use strict'

const redis = require('redis')
const { promisify } = require('util')
const log = require('./log')
const githubAuth = require('./github-auth')
const TokenPersistence = require('./token-persistence')

class RedisTokenPersistence extends TokenPersistence {
  constructor({ url, key }) {
    super()
    this.url = url
    this.key = key
  }

  async initialize() {
    this.client = redis.createClient(this.url)
    this.client.on('error', e => {
      log.error(e)
    })

    const lrange = promisify(this.client.lrange).bind(this.client)

    let tokens
    try {
      tokens = await lrange(this.key, 0, -1)
    } catch (e) {
      log.error(e)
    }

    tokens.forEach(tokenString => {
      githubAuth.addGithubToken(tokenString)
    })
  }

  async stop() {
    const quit = promisify(this.client.quit).bind(this.client)
    await quit()
  }

  async onTokenAdded(token) {
    const rpush = promisify(this.client.rpush).bind(this.client)
    await rpush(this.key, token)
  }

  async onTokenRemoved(token) {
    const lrem = promisify(this.client.lrem).bind(this.client)
    await lrem(this.key, 0, token)
  }
}

module.exports = RedisTokenPersistence
