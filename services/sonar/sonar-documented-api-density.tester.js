import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// The service tests targeting the legacy SonarQube API are mocked
// because of the lack of publicly accessible, self-hosted, legacy SonarQube instances
// See https://github.com/badges/shields/issues/4221#issuecomment-546611598 for more details
// This is an uncommon scenario Shields has to support for Sonar, and should not be used as a model
// for other service tests.

// This metric was deprecated in SonarQube 6.2 and dropped in SonarQube 7.x+
// https://docs.sonarqube.org/6.7/MetricDefinitions.html#src-11634682_MetricDefinitions-Documentation
// https://docs.sonarqube.org/7.0/MetricDefinitions.html
// https://sonarcloud.io/api/measures/component?componentKey=org.sonarsource.sonarqube:sonarqube&metricKeys=public_documented_api_density
t.create('Documented API Density (not found)')
  .get(
    '/org.sonarsource.sonarqube%3Asonarqube.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'public documented api density',
    message: 'metric not found',
  })

t.create('Documented API Density')
  .get(
    '/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.somewhatold.com&sonarVersion=6.1'
  )
  .intercept(nock =>
    nock('http://sonar.somewhatold.com/api')
      .get('/measures/component')
      .query({
        componentKey: 'org.ow2.petals:petals-se-ase',
        metricKeys: 'public_documented_api_density',
      })
      .reply(200, {
        component: {
          measures: [
            {
              metric: 'public_documented_api_density',
              value: 91,
            },
          ],
        },
      })
  )
  .expectBadge({
    label: 'public documented api density',
    message: '91%',
  })

t.create('Documented API Density (legacy API supported)')
  .get(
    '/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'public_documented_api_density',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'public_documented_api_density',
              val: 79,
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'public documented api density',
    message: '79%',
  })
