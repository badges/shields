'use strict'

const { URL } = require('url')
const Redis = require('ioredis')
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
    this.redis = new Redis(this.url, options)
    this.redis.on('error', e => {
      log.error(e)
    })

    const tokens = await this.redis.smembers(this.key)
    return tokens
  }

  async stop() {
    await this.redis.quit()
  }

  async onTokenAdded(token) {
    await this.redis.sadd(this.key, token)
  }

  async onTokenRemoved(token) {
    await this.redis.srem(this.key, token)
  }
}
