import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import OpencollectiveBase from './opencollective-base.js'

class DummyOpencollectiveService extends OpencollectiveBase {
  static route = this.buildRoute('dummy')

  async handle({ collective }) {
    const data = await this.fetchCollectiveInfo({
      collective,
      accountType: [],
    })
    return this.constructor.render(this.getCount(data))
  }
}

describe('OpencollectiveBase', function () {
  describe('auth', function () {
    cleanUpNockAfterEach()

    const config = { private: { opencollective_token: 'fake-token' } }

    it('sends the auth information as configured', async function () {
      const scope = nock('https://api.opencollective.com')
        .post('/graphql/v2')
        .query({ personalToken: 'fake-token' })
        .reply(200, { data: { account: { members: { totalCount: 1 } } } })

      expect(
        await DummyOpencollectiveService.invoke(defaultContext, config, {}),
      ).to.deep.equal({ color: 'brightgreen', label: undefined, message: '1' })

      scope.done()
    })
  })
})
