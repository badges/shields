'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isIntegerPercentage } = require('../test-validators')

t.create('Coverage')
  .get('/swellaby%3Aletra.json?server=https://sonarcloud.io')
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
