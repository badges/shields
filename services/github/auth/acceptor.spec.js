'use strict'

const { expect } = require('chai')
const Camp = require('camp')
const sinon = require('sinon')
const portfinder = require('portfinder')
const queryString = require('query-string')
const nock = require('nock')
const got = require('../../../core/got-test-client')
const serverSecrets = require('../../../lib/server-secrets')
const GithubConstellation = require('../github-constellation')
const acceptor = require('./acceptor')

const fakeClientId = 'githubdabomb'
const fakeShieldsSecret = 'letmeinplz'

describe('Github token acceptor', function() {
  const oauthHelper = GithubConstellation._createOauthHelper({
    gh_client_id: fakeClientId,
  })
  before(function() {
    // Make sure properties exist.
    // https://github.com/sinonjs/sinon/pull/1557
    serverSecrets.shields_ips = undefined
    serverSecrets.shields_secret = undefined
    sinon.stub(serverSecrets, 'shields_ips').value([])
    sinon.stub(serverSecrets, 'shields_secret').value(fakeShieldsSecret)
  })
  after(function() {
    sinon.restore()
  })

  let port, baseUrl
  beforeEach(async function() {
    port = await portfinder.getPortPromise()
    baseUrl = `http://127.0.0.1:${port}`
  })

  let camp
  beforeEach(async function() {
    camp = Camp.start({ port, hostname: '::' })
    await new Promise(resolve => camp.on('listening', () => resolve()))
  })
  afterEach(async function() {
    if (camp) {
      await new Promise(resolve => camp.close(resolve))
      camp = undefined
    }
  })

  let onTokenAccepted
  beforeEach(function() {
    onTokenAccepted = sinon.stub()
    acceptor.setRoutes({
      server: camp,
      authHelper: oauthHelper,
      onTokenAccepted,
    })
  })

  it('should start the OAuth process', async function() {
    const res = await got(`${baseUrl}/github-auth`, { followRedirect: false })

    expect(res.statusCode).to.equal(302)

    const qs = queryString.stringify({
      client_id: fakeClientId,
      redirect_uri: 'https://img.shields.io/github-auth/done',
    })
    const expectedLocationHeader = `https://github.com/login/oauth/authorize?${qs}`
    expect(res.headers.location).to.equal(expectedLocationHeader)
  })

  describe('Finishing the OAuth process', function() {
    context('no code is provided', function() {
      it('should return an error', async function() {
        const res = await got(`${baseUrl}/github-auth/done`)
        expect(res.body).to.equal(
          'GitHub OAuth authentication failed to provide a code.'
        )
      })
    })

    const fakeCode = '123456789'
    const fakeAccessToken = 'abcdef'

    context('a code is provided', function() {
      let scope
      beforeEach(function() {
        nock.enableNetConnect(/127\.0\.0\.1/)

        scope = nock('https://github.com')
          .post('/login/oauth/access_token')
          .reply((url, requestBody) => {
            expect(queryString.parse(requestBody).code).to.equal(fakeCode)
            return [
              200,
              queryString.stringify({ access_token: fakeAccessToken }),
            ]
          })
      })

      afterEach(function() {
        // Make sure other tests will make live requests even when this test
        // fails.
        nock.enableNetConnect()
      })

      afterEach(function() {
        if (scope) {
          scope.done()
          scope = null
        }
      })

      afterEach(function() {
        nock.cleanAll()
      })

      it('should finish the OAuth process', async function() {
        const res = await got(`${baseUrl}/github-auth/done`, {
          form: true,
          body: { code: fakeCode },
        })
        expect(res.body).to.startWith(
          '<p>Shields.io has received your app-specific GitHub user token.'
        )
      })
    })
  })

  it('should add a received token', async function() {
    const fakeAccessToken = 'its-my-token'

    const { body } = await got(`${baseUrl}/github-auth/add-token`, {
      form: true,
      body: { shieldsSecret: fakeShieldsSecret, token: fakeAccessToken },
    })

    expect(onTokenAccepted).to.have.been.calledWith(fakeAccessToken)
    expect(body).to.equal('Thanks!')
  })
})
