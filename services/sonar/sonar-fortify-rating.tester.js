'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'SonarFortifyRating',
  title: 'SonarFortifyRating',
  pathPrefix: '/sonar',
}))

// The below tests are using a mocked API response because
// neither SonarCloud.io nor any known public SonarQube deployments
// have the Fortify plugin installed and in use, so there are no
// available live endpoints to hit.
t.create('Fortify Security Rating')
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
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/fortify-security-rating.json?version=4.2'
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
              metric: 'fortify-security-rating',
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
