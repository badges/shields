'use strict'

const { expect } = require('chai')
const sinon = require('sinon')
const Camp = require('camp')
const fetch = require('node-fetch')
const config = require('../../../lib/test-config')
const serverSecrets = require('../../../lib/server-secrets')
const { setRoutes } = require('./admin')

function createAuthHeader({ username, password }) {
  const headers = new fetch.Headers()
  const encoded = Buffer.from(`${username}:${password}`).toString('base64')
  headers.append('authorization', `Basic ${encoded}`)
  return headers
}

describe('GitHub admin route', function() {
  const validCredentials = {
    username: '',
    password: '7'.repeat(40),
  }

  let sandbox
  beforeEach(function() {
    sandbox = sinon.createSandbox()
    // Make this work when there is no `shieldsSecret` defined.
    serverSecrets.shieldsSecret = undefined
    sandbox
      .stub(serverSecrets, 'shieldsSecret')
      .value(validCredentials.password)
  })
  afterEach(function() {
    sandbox.restore()
  })

  const baseUrl = `http://127.0.0.1:${config.port}`

  let camp
  before(function(done) {
    camp = Camp.start({ port: config.port, hostname: '::' })
    camp.on('listening', () => done())
  })
  after(function(done) {
    if (camp) {
      camp.close(() => done())
      camp = undefined
    }
  })

  before(function() {
    setRoutes(camp)
  })

  context('the password is correct', function() {
    it('returns a valid JSON response', async function() {
      const res = await fetch(`${baseUrl}/$github-auth/tokens`, {
        headers: createAuthHeader(validCredentials),
      })
      expect(res.ok).to.be.true
      expect(await res.json()).to.be.ok
    })
  })

  // Disabled because this code isn't modified often and the test is very
  // slow. I wasn't able to make this work with fake timers:
  // https://github.com/sinonjs/sinon/issues/1739
  // context('the password is missing', function() {
  //   it('returns the expected message', async function() {
  //     this.timeout(11000)
  //     const res = await fetch(`${baseUrl}/$github-auth/tokens`)
  //     expect(res.ok).to.be.true
  //     expect(await res.text()).to.equal('"Invalid secret."')
  //   })
  // })
})
