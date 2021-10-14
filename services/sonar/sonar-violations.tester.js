import Joi from 'joi'
import { isMetric, withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()
const isViolationsLongFormMetric = Joi.alternatives(
  Joi.allow(0),
  withRegex(
    /(([\d]+) (blocker|critical|major|minor|info))(,\s([\d]+) (critical|major|minor|info))?/
  )
)

// The service tests targeting the legacy SonarQube API are mocked
// because of the lack of publicly accessible, self-hosted, legacy SonarQube instances
// See https://github.com/badges/shields/issues/4221#issuecomment-546611598 for more details
// This is an uncommon scenario Shields has to support for Sonar, and should not be used as a model
// for other service tests.

t.create('Violations')
  .timeout(10000)
  .get(
    '/violations/org.sonarsource.sonarqube%3Asonarqube.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'violations',
    message: isMetric,
  })

t.create('Violations (branch)')
  .timeout(10000)
  .get(
    '/violations/org.sonarsource.sonarqube%3Asonarqube/master.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'violations',
    message: isMetric,
  })

t.create('Violations (legacy API supported)')
  .get(
    '/violations/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'violations',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'violations',
              val: '7',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'violations',
    message: '7',
  })

t.create('Violations Long Format')
  .timeout(10000)
  .get(
    '/violations/org.sonarsource.sonarqube%3Asonarqube.json?server=https://sonarcloud.io&format=long'
  )
  .expectBadge({
    label: 'violations',
    message: isViolationsLongFormMetric,
  })

t.create('Violations Long Format (legacy API supported)')
  .get(
    '/violations/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2&format=long'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics:
          'violations,blocker_violations,critical_violations,major_violations,minor_violations,info_violations',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'violations',
              val: '10',
            },
            {
              key: 'blocker_violations',
              val: '1',
            },
            {
              key: 'critical_violations',
              val: '0',
            },
            {
              key: 'major_violations',
              val: '2',
            },
            {
              key: 'minor_violations',
              val: '0',
            },
            {
              key: 'info_violations',
              val: '7',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'violations',
    message: '1 blocker, 2 major, 7 info',
  })

t.create('Blocker Violations')
  .timeout(10000)
  .get(
    '/blocker_violations/org.sonarsource.sonarqube%3Asonarqube.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'blocker violations',
    message: isMetric,
  })

t.create('Blocker Violations (legacy API supported)')
  .get(
    '/blocker_violations/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'blocker_violations',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'blocker_violations',
              val: '1',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'blocker violations',
    message: '1',
  })

t.create('Critical Violations')
  .timeout(10000)
  .get(
    '/critical_violations/org.sonarsource.sonarqube%3Asonarqube.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'critical violations',
    message: isMetric,
  })

t.create('Critical Violations (legacy API supported)')
  .get(
    '/critical_violations/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .intercept(nock =>
    nock('http://sonar.petalslink.com/api')
      .get('/resources')
      .query({
        resource: 'org.ow2.petals:petals-se-ase',
        depth: 0,
        metrics: 'critical_violations',
        includeTrends: true,
      })
      .reply(200, [
        {
          msr: [
            {
              key: 'critical_violations',
              val: '2',
            },
          ],
        },
      ])
  )
  .expectBadge({
    label: 'critical violations',
    message: '2',
  })
