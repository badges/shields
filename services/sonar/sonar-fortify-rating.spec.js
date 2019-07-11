'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { cleanUpNockAfterEach, defaultContext } = require('../test-helpers')
const SonarFortifyRating = require('./sonar-fortify-rating.service')

const token = 'abc123def456'
const config = { private: { sonarqube_token: token } }

describe('SonarFortifyRating', function() {
  cleanUpNockAfterEach()

  it('sends the auth information as configured', async function() {
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
      await SonarFortifyRating.invoke(defaultContext, config, {
        protocol: 'http',
        host: 'sonar.petalslink.com',
        component: 'org.ow2.petals:petals-se-ase',
      })
    ).to.deep.equal({
      color: 'green',
      message: '4/5',
    })

    scope.done()
  })
})
