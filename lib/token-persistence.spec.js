'use strict'

const fs = require('fs')
const tmp = require('tmp')
const readFile = require('fs-readfile-promise')
const sinon = require('sinon')
const { sleep } = require('wait-promise')
const { expect } = require('chai')
const TokenPersistence = require('./token-persistence')
const githubAuth = require('./github-auth')

describe('Token persistence', function() {
  // Fake timers must be set up before any timers are scheduled.
  let clock
  beforeEach(function() {
    clock = sinon.useFakeTimers()
  })
  afterEach(function() {
    clock.restore()
  })

  beforeEach(githubAuth.removeAllTokens)
  afterEach(githubAuth.removeAllTokens)

  let path, persistence
  beforeEach(function() {
    path = tmp.tmpNameSync()
    persistence = new TokenPersistence({ path })
  })
  afterEach(function() {
    if (persistence) {
      persistence.stop()
      persistence = null
    }
  })

  context('when the file does not exist', function() {
    it('creates it with an empty array', async function() {
      await persistence.initialize()
      const json = JSON.parse(await readFile(path))

      expect(json).to.deep.equal([])
    })
  })

  context('when the file exists', function() {
    it('loads the contents', async function() {
      const initialTokens = ['a', 'b', 'c'].map(char => char.repeat(40))
      fs.writeFileSync(path, JSON.stringify(initialTokens))

      await persistence.initialize()

      expect(githubAuth.getAllTokenIds()).to.deep.equal(initialTokens)
    })
  })

  context('when shutting down', function() {
    it('writes added tokens to the file', async function() {
      const initialTokens = ['a', 'b', 'c'].map(char => char.repeat(40))
      fs.writeFileSync(path, JSON.stringify(initialTokens))

      const newToken = 'e'.repeat(40)
      const expected = initialTokens.slice()
      expected.push(newToken)

      await persistence.initialize()
      githubAuth.addGithubToken(newToken)
      await persistence.stop()

      const json = JSON.parse(await readFile(path))
      expect(json).to.deep.equal(expected)
    })
  })

  context('time has elapsed', function() {
    it('writes added tokens to the file', async function() {
      const addedTokens = ['d', 'e'].map(char => char.repeat(40))

      await persistence.initialize()

      addedTokens.forEach(githubAuth.addGithubToken)

      // Fake time passing to trigger autosaving, then give the save a brief
      // moment of real time to complete before reading.
      clock.tick(5000)
      clock.restore()
      await sleep(200)

      const json = JSON.parse(await readFile(path))
      expect(json).to.deep.equal(addedTokens)
    })
  })
})
