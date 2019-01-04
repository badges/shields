'use strict'

const { promisify } = require('util')
const RedisServer = require('redis-server')
const redis = require('redis')
const { expect } = require('chai')
const RedisTokenPersistence = require('./redis-token-persistence')
const githubAuth = require('./github-auth')

describe('Redis token persistence', function() {
  beforeEach(githubAuth.removeAllTokens)
  afterEach(githubAuth.removeAllTokens)

  let server
  // In CI, expect redis already to be running.
  if (!process.env.CI) {
    beforeEach(async function() {
      server = new RedisServer({ config: { host: 'localhost' } })
      await server.open()
    })
  }

  const key = 'tokenPersistenceIntegrationTest'

  let client
  beforeEach(async function() {
    client = redis.createClient()
    const del = promisify(client.del).bind(client)
    await del(key)
  })
  afterEach(async function() {
    if (client) {
      const quit = promisify(client.quit).bind(client)
      await quit()
      client = undefined
    }
  })

  if (!process.env.CI) {
    afterEach(async function() {
      await server.close()
      server = undefined
    })
  }

  let persistence
  beforeEach(function() {
    persistence = new RedisTokenPersistence({ key })
  })
  afterEach(async function() {
    if (persistence) {
      await persistence.stop()
      persistence = undefined
    }
  })

  context('when the key does not exist', function() {
    it('does nothing', async function() {
      await persistence.initialize()
      expect(githubAuth.getAllTokenIds()).to.deep.equal([])
    })
  })

  context('when the key exists', function() {
    const initialTokens = ['a', 'b', 'c'].map(char => char.repeat(40))

    beforeEach(async function() {
      const rpush = promisify(client.rpush).bind(client)
      await rpush(key, initialTokens)
    })

    let lrange
    beforeEach(function() {
      lrange = promisify(client.lrange).bind(client)
    })

    it('loads the contents', async function() {
      await persistence.initialize()
      expect(githubAuth.getAllTokenIds()).to.deep.equal(initialTokens)
    })

    context('when tokens are added', function() {
      it('saves the change', async function() {
        const newToken = 'e'.repeat(40)
        const expected = initialTokens.slice()
        expected.push(newToken)

        await persistence.initialize()
        githubAuth.addGithubToken(newToken)
        await persistence.noteTokenAdded(newToken)

        const savedTokens = await lrange(key, 0, -1)
        expect(savedTokens).to.deep.equal(expected)
      })
    })

    context('when tokens are removed', function() {
      it('saves the change', async function() {
        const expected = Array.from(initialTokens)
        const toRemove = expected.pop()

        await persistence.initialize()

        githubAuth.rmGithubToken(toRemove)
        await persistence.noteTokenRemoved(toRemove)

        const savedTokens = await lrange(key, 0, -1)
        expect(savedTokens).to.deep.equal(expected)
      })
    })
  })
})
