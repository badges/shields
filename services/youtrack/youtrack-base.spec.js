import Joi from 'joi'
import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import YoutrackBase from './youtrack-base.js'

class DummyYoutrackService extends YoutrackBase {
  static route = { base: 'fake-base' }

  async handle() {
    const data = await this.fetch({
      schema: Joi.any(),
      url: 'https://shields.youtrack.cloud/api/issuesGetter/count?fields=count',
    })
    return { message: data.message }
  }
}

describe('YoutrackBase', function () {
  describe('auth', function () {
    cleanUpNockAfterEach()

    const config = {
      public: {
        services: {
          youtrack: {
            authorizedOrigins: ['https://shields.youtrack.cloud'],
          },
        },
      },
      private: {
        youtrack_token: 'fake-key',
      },
    }

    it('sends the auth information as configured', async function () {
      const scope = nock('https://shields.youtrack.cloud')
        .get('/api/issuesGetter/count?fields=count')
        .matchHeader('Authorization', 'Bearer fake-key')
        .reply(200, { message: 'fake message' })
      expect(
        await DummyYoutrackService.invoke(defaultContext, config, {}),
      ).to.not.have.property('isError')

      scope.done()
    })
  })
})
