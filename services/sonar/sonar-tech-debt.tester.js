import { isPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// The service tests targeting the legacy SonarQube API are mocked
// because of the lack of publicly accessible, self-hosted, legacy SonarQube instances
// See https://github.com/badges/shields/issues/4221#issuecomment-546611598 for more details
// This is an uncommon scenario Shields has to support for Sonar, and should not be used as a model
// for other service tests.

t.create('Tech Debt')
  .get(
    '/tech_debt/org.sonarsource.sonarqube%3Asonarqube.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'tech debt',
    message: isPercentage,
  })

t.create('Tech Debt (branch)')
  .get(
    '/tech_debt/org.sonarsource.sonarqube%3Asonarqube/master.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'tech debt',
    message: isPercentage,
  })

t.create('Tech Debt (legacy API supported)')
  .get(
    '/tech_debt/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'sqale_debt_ratio',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'sqale_debt_ratio',
              val: '7',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'tech debt',
    message: '7%',
  })
