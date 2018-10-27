'use strict'

const { expect } = require('chai')
const Camp = require('camp')
const got = require('got')
const queryString = require('query-string')
const sinon = require('sinon')
const config = require('../../../lib/test-config')
const serverSecrets = require('../../../lib/server-secrets')
const acceptor = require('./acceptor')

const baseUri = `http://127.0.0.1:${config.port}`
const fakeClientId = 'githubdabomb'

describe('Github token acceptor', function() {
  describe('OAuth start endpoint', function() {
    let sandbox
    beforeEach(function() {
      sandbox = sinon.createSandbox()
      sandbox.stub(serverSecrets, 'gh_client_id').value(fakeClientId)
    })

    afterEach(function() {
      sandbox.restore()
    })

    let camp
    beforeEach(function(done) {
      camp = Camp.start({ port: config.port, hostname: '::' })
      camp.on('listening', () => done())
    })

    afterEach(function(done) {
      if (camp) {
        camp.close(() => done())
        camp = null
      }
    })

    beforeEach(function() {
      acceptor.setRoutes(camp)
    })

    it('should start the OAuth process', async function() {
      const res = await got(`${baseUri}/github-auth`, { followRedirect: false })

      expect(res.statusCode).to.equal(302)

      const qs = queryString.stringify({
        client_id: fakeClientId,
        redirect_uri: 'https://img.shields.io/github-auth/done',
      })
      const expectedLocationHeader = `https://github.com/login/oauth/authorize?${qs}`
      expect(res.headers.location).to.equal(expectedLocationHeader)
    })
  })
})
