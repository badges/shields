'use strict'

const t = (module.exports = require('../tester').createServiceTester())

// The below tests are using a mocked API response because
// neither SonarCloud.io nor any known public SonarQube deployments
// have the Fortify plugin installed and in use, so there are no
// available live endpoints to hit.
t.create('Fortify Security Rating')
  .get('/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.shields.test')
  .intercept(nock =>
    nock('http://sonar.shields.test')
      .get('/api/measures/component')
      .query({
        componentKey: 'org.ow2.petals:petals-se-ase',
        metricKeys: 'fortify-security-rating',
      })
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
  .expectBadge({
    label: 'fortify-security-rating',
    message: '4/5',
  })

t.create('Fortify Security Rating (legacy API supported)')
  .get(
    '/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
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
    '/swellaby:azdo-shellcheck.json?server=https://sonarcloud.io&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'fortify-security-rating',
    message: 'component or metric not found, or legacy API not supported',
  })

t.create('Fortify Security Rating (nonexistent component)')
  .get('/not-a-real-component-fakeness.json?server=https://sonarcloud.io')
  .expectBadge({
    label: 'fortify-security-rating',
    message: 'component or metric not found, or legacy API not supported',
  })
