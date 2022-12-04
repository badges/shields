import Joi from 'joi'
import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import { StackExchangeBase } from './stackexchange-base.js'

class DummyStackExchangeService extends StackExchangeBase {
  static route = { base: 'fake-base' }

  async handle() {
    const data = await this.fetch({
      schema: Joi.any(),
      url: 'https://api.stackexchange.com/2.2/tags/python/info',
    })
    return { message: data.message }
  }
}

describe('StackExchangeBase', function () {
  describe('auth', function () {
    cleanUpNockAfterEach()

    const config = { private: { stackapps_api_key: 'fake-key' } }

    it('sends the auth information as configured', async function () {
      const scope = nock('https://api.stackexchange.com')
        .get('/2.2/tags/python/info')
        .query({ key: 'fake-key' })
        .reply(200, { message: 'fake message' })

      expect(
        await DummyStackExchangeService.invoke(defaultContext, config, {})
      ).to.deep.equal({ message: 'fake message' })

      scope.done()
    })
  })
})
