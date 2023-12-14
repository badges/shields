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
      url: 'https://codeberg.com/api/v1/repos/CanisHelix/shields-badge-test/releases',
    })
    return { message: data.message }
  }
}

describe('GiteaBase', function () {
  describe('auth', function () {
    cleanUpNockAfterEach()

    const config = { private: { gitea_token: 'fake-key' } }

    it('sends the auth information as configured', async function () {
      const scope = nock('https://codeberg.com')
        .get('/api/v1/repos/CanisHelix/shields-badge-test/releases')
        .query({ key: 'fake-key' })
        .reply(200, { message: 'fake message' })

      expect(
        await DummyGiteaService.invoke(defaultContext, config, {}),
      ).to.deep.equal({ message: 'fake message' })

      scope.done()
    })
  })
})
