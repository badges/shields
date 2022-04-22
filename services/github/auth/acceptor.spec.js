import { expect } from 'chai'
import FormData from 'form-data'
import sinon from 'sinon'
import queryString from 'query-string'
import nock from 'nock'
import { ExpressTestHarness } from '../../../core/express-test-harness.js'
import GithubConstellation from '../github-constellation.js'
import { setRoutes } from './acceptor.js'

const fakeClientId = 'githubdabomb'
const fakeClientSecret = 'foobar'

describe('Github token acceptor', function () {
  const oauthHelper = GithubConstellation._createOauthHelper({
    private: { gh_client_id: fakeClientId, gh_client_secret: fakeClientSecret },
  })

  let harness, onTokenAccepted
  beforeEach(async function () {
    harness = new ExpressTestHarness()

    onTokenAccepted = sinon.stub()
    setRoutes({
      app: harness.app,
      authHelper: oauthHelper,
      onTokenAccepted,
    })

    await harness.start()
  })

  afterEach(async function () {
    await harness.stop()
  })

  it('should start the OAuth process', async function () {
    const res = await harness.post('/github-auth', { followRedirect: false })

    expect(res.statusCode).to.equal(302)

    const qs = queryString.stringify({
      client_id: fakeClientId,
      redirect_uri: 'https://img.shields.io/github-auth/done',
    })
    const expectedLocationHeader = `https://github.com/login/oauth/authorize?${qs}`
    expect(res.headers.location).to.equal(expectedLocationHeader)
  })

  describe('Finishing the OAuth process', function () {
    context('no code is provided', function () {
      it('should return an error', async function () {
        const { body } = await harness.post('/github-auth/done')
        expect(body).to.equal(
          'GitHub OAuth authentication failed to provide a code.'
        )
      })
    })

    const fakeCode = '123456789'
    const fakeAccessToken = 'abcdef'

    context('a code is provided', function () {
      let scope
      beforeEach(function () {
        nock.enableNetConnect(/127\.0\.0\.1/)

        scope = nock('https://github.com')
          .post('/login/oauth/access_token')
          .reply((url, requestBody) => {
            const parsedBody = queryString.parse(requestBody)
            expect(parsedBody.client_id).to.equal(fakeClientId)
            expect(parsedBody.client_secret).to.equal(fakeClientSecret)
            expect(parsedBody.code).to.equal(fakeCode)
            return [
              200,
              queryString.stringify({ access_token: fakeAccessToken }),
            ]
          })
      })

      afterEach(function () {
        // Make sure other tests will make live requests even when this test
        // fails.
        nock.enableNetConnect()
      })

      afterEach(function () {
        if (scope) {
          scope.done()
          scope = null
        }
      })

      afterEach(function () {
        nock.cleanAll()
      })

      it('should finish the OAuth process', async function () {
        const form = new FormData()
        form.append('code', fakeCode)

        const res = await harness.post('/github-auth/done', { body: form })
        expect(res.body).to.startWith(
          '<p>Shields.io has received your app-specific GitHub user token.'
        )

        expect(onTokenAccepted).to.have.been.calledWith(fakeAccessToken)
      })
    })
  })
})
