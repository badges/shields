'use strict'

const { expect } = require('chai')
const sinon = require('sinon')
const Camp = require('camp')
const fetch = require('node-fetch')
const portfinder = require('portfinder')
const serverSecrets = require('../../../lib/server-secrets')
const GithubApiProvider = require('../github-api-provider')
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
    // Make this work when there is no `shields_secret` defined.
    serverSecrets.shields_secret = undefined
    sandbox
      .stub(serverSecrets, 'shields_secret')
      .value(validCredentials.password)
  })
  afterEach(function() {
    sandbox.restore()
  })

  let port, baseUrl
  before(async function() {
    port = await portfinder.getPortPromise()
    baseUrl = `http://127.0.0.1:${port}`
  })

  let camp
  before(async function() {
    camp = Camp.start({ port, hostname: '::' })
    await new Promise(resolve => camp.on('listening', () => resolve()))
  })
  after(async function() {
    if (camp) {
      await new Promise(resolve => camp.close(resolve))
      camp = undefined
    }
  })

  before(function() {
    const apiProvider = new GithubApiProvider({ withPooling: true })
    setRoutes(apiProvider, camp)
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
