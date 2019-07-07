'use strict'

const { promisify } = require('util')
const redis = require('redis')
const log = require('../server/log')
const TokenPersistence = require('./token-persistence')

module.exports = class RedisTokenPersistence extends TokenPersistence {
  constructor({ url, key }) {
    super()
    this.url = url
    this.key = key
  }

  async initialize() {
    const options =
      this.url && this.url.startsWith('rediss:')
        ? {
            //  https://www.compose.com/articles/ssl-connections-arrive-for-redis-on-compose/
            tls: { servername: new URL(this.url).hostname },
          }
        : undefined
    this.client = redis.createClient(this.url, options)
    this.client.on('error', e => {
      log.error(e)
    })

    const smembers = promisify(this.client.smembers).bind(this.client)
    const tokens = await smembers(this.key)
    return tokens
  }

  async stop() {
    const quit = promisify(this.client.quit).bind(this.client)
    await quit()
  }

  async onTokenAdded(token) {
    const sadd = promisify(this.client.sadd).bind(this.client)
    await sadd(this.key, token)
  }

  async onTokenRemoved(token) {
    const srem = promisify(this.client.srem).bind(this.client)
    await srem(this.key, token)
  }
}
