import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isQualityGateStatus = Joi.allow('passed', 'failed')

// The service tests targeting the legacy SonarQube API are mocked
// because of the lack of publicly accessible, self-hosted, legacy SonarQube instances
// See https://github.com/badges/shields/issues/4221#issuecomment-546611598 for more details
// This is an uncommon scenario Shields has to support for Sonar, and should not be used as a model
// for other service tests.

t.create('Quality Gate')
  .get(
    '/quality_gate/swellaby%3Aazdo-shellcheck.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'quality gate',
    message: isQualityGateStatus,
  })

t.create('Quality Gate (branch)')
  .get(
    '/quality_gate/swellaby%3Aazdo-shellcheck/master.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'quality gate',
    message: isQualityGateStatus,
  })

t.create('Quality Gate (Alert Status)')
  .get(
    '/alert_status/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'alert_status',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'alert_status',
              val: 'OK',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'quality gate',
    message: 'passed',
  })

// Public instance shared by community member and permission granted for usage in tests
// https://github.com/badges/shields/pull/6636#issuecomment-886172161
t.create('Quality Gate (version >= 6.6)')
  .get(
    '/quality_gate/de.chkpnt%3Atruststorebuilder-gradle-plugin.json?server=https://sonar.chkpnt.de&sonarVersion=8.9'
  )
  .expectBadge({
    label: 'quality gate',
    message: isQualityGateStatus,
  })
