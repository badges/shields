import { createServiceTester } from '../tester.js'
import { isIntegerPercentage } from '../test-validators.js'
export const t = await createServiceTester()

// The service tests targeting the legacy SonarQube API are mocked
// because of the lack of publicly accessible, self-hosted, legacy SonarQube instances
// See https://github.com/badges/shields/issues/4221#issuecomment-546611598 for more details
// This is an uncommon scenario Shields has to support for Sonar, and should not be used as a model
// for other service tests.

t.create('Coverage')
  .get('/swellaby%3Aletra.json?server=https://sonarcloud.io')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage (branch)')
  .get('/swellaby%3Aletra/master.json?server=https://sonarcloud.io')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage (legacy API supported)')
  .get(
    '/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'coverage',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'coverage',
              val: 83,
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'coverage',
    message: '83%',
  })
