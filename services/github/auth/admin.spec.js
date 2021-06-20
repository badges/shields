import { expect } from 'chai'
import Camp from '@shields_io/camp'
import portfinder from 'portfinder'
import got from '../../../core/got-test-client.js'
import GithubApiProvider from '../github-api-provider.js'
import { setRoutes } from './admin.js'

describe('GitHub admin route', function () {
  const shieldsSecret = '7'.repeat(40)

  let port, baseUrl
  before(async function () {
    port = await portfinder.getPortPromise()
    baseUrl = `http://127.0.0.1:${port}`
  })

  let camp
  before(async function () {
    camp = Camp.start({ port, hostname: '::' })
    await new Promise(resolve => camp.on('listening', () => resolve()))
  })
  after(async function () {
    if (camp) {
      await new Promise(resolve => camp.close(resolve))
      camp = undefined
    }
  })

  before(function () {
    const apiProvider = new GithubApiProvider({ withPooling: true })
    setRoutes({ shieldsSecret }, { apiProvider, server: camp })
  })

  context('the password is correct', function () {
    it('returns a valid JSON response', async function () {
      const { statusCode, body, headers } = await got(
        `${baseUrl}/$github-auth/tokens`,
        {
          username: '',
          password: shieldsSecret,
          responseType: 'json',
        }
      )
      expect(statusCode).to.equal(200)
      expect(body).to.be.ok
      expect(headers['cache-control']).to.equal('private')
    })
  })

  // Disabled because this code isn't modified often and the test is very
  // slow. To run it, run `SLOW=true npm run test:core`
  //
  // I wasn't able to make this work with fake timers:
  // https://github.com/sinonjs/sinon/issues/1739
  if (process.env.SLOW) {
    context('the password is missing', function () {
      it('returns the expected message', async function () {
        this.timeout(11000)
        const { statusCode, body, headers } = await got(
          `${baseUrl}/$github-auth/tokens`,
          {
            throwHttpErrors: false,
          }
        )
        expect(statusCode).to.equal(401)
        expect(body).to.equal('"Invalid secret."')
        expect(headers['cache-control']).to.equal('private')
      })
    })
  }
})
