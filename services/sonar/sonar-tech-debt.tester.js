'use strict'

const { isPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Tech Debt')
  .get(
    '/tech_debt/org.sonarsource.sonarqube%3Asonarqube.json?server=https://sonarcloud.io'
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
