'use strict'

const sinon = require('sinon')
const t = (module.exports = require('../tester').createServiceTester())
const serverSecrets = require('../../lib/server-secrets')
const sonarToken = 'abc123def456'

// The below tests are using a mocked API response because
// neither SonarCloud.io nor any known public SonarQube deployments
// have the Fortify plugin installed and in use, so there are no
// available live endpoints to hit.
t.create('Fortify Security Rating')
  .before(() => {
    serverSecrets['sonarqube_token'] = undefined
    sinon.stub(serverSecrets, 'sonarqube_token').value(sonarToken)
  })
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/fortify-security-rating.json'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api/measures')
      .get('/component')
      .query({
        componentKey: 'org.ow2.petals:petals-se-ase',
        metricKeys: 'fortify-security-rating',
      })
      .basicAuth({ user: sonarToken })
      .reply(200, {
        component: {
          measures: [
            {
              metric: 'fortify-security-rating',
              value: 4,
            },
          ],
        },
      })
  )
  .finally(sinon.restore)
  .expectBadge({
    label: 'fortify-security-rating',
    message: '4/5',
  })

t.create('Fortify Security Rating (legacy API supported)')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/fortify-security-rating.json?sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'fortify-security-rating',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'fortify-security-rating',
              val: 3,
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'fortify-security-rating',
    message: '3/5',
  })

t.create('Fortify Security Rating (legacy API not supported)')
  .get(
    '/https/sonarcloud.io/swellaby:azdo-shellcheck/fortify-security-rating.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'fortify-security-rating',
    message: 'component or metric not found, or legacy API not supported',
  })

t.create('Fortify Security Rating (nonexistent component)')
  .get(
    '/https/sonarcloud.io/not-a-real-component-fakeness/fortify-security-rating.json'
  )
  .expectBadge({
    label: 'fortify-security-rating',
    message: 'component or metric not found, or legacy API not supported',
  })
