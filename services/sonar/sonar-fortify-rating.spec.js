import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import SonarFortifyRating from './sonar-fortify-rating.service.js'

const token = 'abc123def456'
const config = {
  public: {
    services: {
      sonar: { authorizedOrigins: ['http://sonar.petalslink.com'] },
    },
  },
  private: {
    sonarqube_token: token,
  },
}

describe('SonarFortifyRating', function () {
  cleanUpNockAfterEach()

  it('sends the auth information as configured', async function () {
    const scope = nock('http://sonar.petalslink.com')
      .get('/api/measures/component')
      .query({
        componentKey: 'org.ow2.petals:petals-se-ase',
        metricKeys: 'fortify-security-rating',
      })
      // This ensures that the expected credentials are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({ user: token })
      .reply(200, {
        component: {
          measures: [{ metric: 'fortify-security-rating', value: 4 }],
        },
      })

    expect(
      await SonarFortifyRating.invoke(
        defaultContext,
        config,
        { component: 'org.ow2.petals:petals-se-ase' },
        { server: 'http://sonar.petalslink.com' }
      )
    ).to.deep.equal({
      color: 'green',
      message: '4/5',
    })

    scope.done()
  })
})
