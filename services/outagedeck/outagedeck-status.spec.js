import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import OutageDeckStatus from './outagedeck-status.service.js'

describe('OutageDeckStatus', function () {
  describe('auth', function () {
    cleanUpNockAfterEach()

    const config = {
      private: {
        outagedeck_api_key: 'fake-key',
      },
    }

    it('sends the auth information as configured', async function () {
      const scope = nock('https://outagedeck.com')
        .get('/api/v1/providers/github')
        .matchHeader('Authorization', 'Bearer fake-key')
        .reply(200, {
          data: { currentStatus: { code: 'operational' } },
        })

      expect(
        await OutageDeckStatus.invoke(defaultContext, config, {
          provider: 'github',
        }),
      ).to.not.have.property('isError')

      scope.done()
    })
  })
})
