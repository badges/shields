import { URL } from 'url'
import Redis from 'ioredis'
import log from '../server/log.js'

export default class RedisTokenPersistence {
  constructor({ url, key }) {
    this.url = url
    this.key = key
    this.noteTokenAdded = this.noteTokenAdded.bind(this)
    this.noteTokenRemoved = this.noteTokenRemoved.bind(this)
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

  async noteTokenAdded(token) {
    try {
      await this.onTokenAdded(token)
    } catch (e) {
      log.error(e)
    }
  }

  async noteTokenRemoved(token) {
    try {
      await this.onTokenRemoved(token)
    } catch (e) {
      log.error(e)
    }
  }
}
