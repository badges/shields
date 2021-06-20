import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
// use NPM Version as an example implementation of NpmBase for this test
import NpmVersion from './npm-version.service.js'

describe('npm', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      cleanUpNockAfterEach()

      const token = 'abc123'

      const scope = nock('https://registry.npmjs.org', {
        reqheaders: { Accept: '*/*', Authorization: `Bearer ${token}` },
      })
        .get('/-/package/npm/dist-tags')
        .reply(200, { latest: '0.1.0' })

      const config = {
        public: {
          services: {
            npm: {
              authorizedOrigins: ['https://registry.npmjs.org'],
            },
          },
        },
        private: {
          npm_token: token,
        },
      }

      expect(
        await NpmVersion.invoke(defaultContext, config, { packageName: 'npm' })
      ).to.deep.equal({
        color: 'orange',
        label: undefined,
        message: 'v0.1.0',
      })

      scope.done()
    })
  })
})
