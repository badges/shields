import Joi from 'joi'
import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import GiteaBase from './gitea-base.js'

class DummyGiteaService extends GiteaBase {
  static route = { base: 'fake-base' }

  async handle() {
    const data = await this.fetch({
      schema: Joi.any(),
      url: 'https://gitea.com/api/v1/repos/CanisHelix/shields-badge-test/releases',
    })
    return { message: data.message }
  }
}

describe('GiteaBase', function () {
  describe('auth', function () {
    cleanUpNockAfterEach()

    const config = {
      public: {
        services: {
          gitea: {
            authorizedOrigins: ['https://gitea.com'],
          },
        },
      },
      private: {
        gitea_token: 'fake-key',
      },
    }

    it('sends the auth information as configured', async function () {
      const scope = nock('https://gitea.com')
        .get('/api/v1/repos/CanisHelix/shields-badge-test/releases')
        .matchHeader('Authorization', 'Bearer fake-key')
        .reply(200, { message: 'fake message' })
      expect(
        await DummyGiteaService.invoke(defaultContext, config, {}),
      ).to.not.have.property('isError')

      scope.done()
    })
  })
})
