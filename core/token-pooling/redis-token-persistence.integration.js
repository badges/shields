import RedisServer from 'redis-server'
import Redis from 'ioredis'
import { expect } from 'chai'
import RedisTokenPersistence from './redis-token-persistence.js'

describe('Redis token persistence', function () {
  let server
  // In CI, expect redis already to be running.
  if (!process.env.CI) {
    beforeEach(async function () {
      server = new RedisServer({ config: { host: 'localhost' } })
      await server.open()
    })
  }

  const key = 'tokenPersistenceIntegrationTest'

  let redis
  beforeEach(async function () {
    redis = new Redis()
    await redis.del(key)
  })
  afterEach(async function () {
    if (redis) {
      await redis.quit()
      redis = undefined
    }
  })

  if (!process.env.CI) {
    afterEach(async function () {
      await server.close()
      server = undefined
    })
  }

  let persistence
  beforeEach(function () {
    persistence = new RedisTokenPersistence({ key })
  })
  afterEach(async function () {
    if (persistence) {
      await persistence.stop()
      persistence = undefined
    }
  })

  context('when the key does not exist', function () {
    it('does nothing', async function () {
      const tokens = await persistence.initialize()
      expect(tokens).to.deep.equal([])
    })
  })

  context('when the key exists', function () {
    const initialTokens = ['a', 'b', 'c'].map(char => char.repeat(40))

    beforeEach(async function () {
      await redis.sadd(key, initialTokens)
    })

    it('loads the contents', async function () {
      const tokens = await persistence.initialize()
      expect(tokens.sort()).to.deep.equal(initialTokens)
    })

    context('when tokens are added', function () {
      it('saves the change', async function () {
        const newToken = 'e'.repeat(40)
        const expected = initialTokens.slice()
        expected.push(newToken)

        await persistence.initialize()
        await persistence.noteTokenAdded(newToken)

        const savedTokens = await redis.smembers(key)
        expect(savedTokens.sort()).to.deep.equal(expected)
      })
    })

    context('when tokens are removed', function () {
      it('saves the change', async function () {
        const expected = Array.from(initialTokens)
        const toRemove = expected.pop()

        await persistence.initialize()

        await persistence.noteTokenRemoved(toRemove)

        const savedTokens = await redis.smembers(key)
        expect(savedTokens.sort()).to.deep.equal(expected)
      })
    })
  })
})
