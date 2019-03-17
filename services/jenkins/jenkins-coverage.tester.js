'use strict'

const { ServiceTester } = require('../tester')
const { isIntegerPercentage } = require('../test-validators')

const t = new ServiceTester({
  id: 'jenkins-coverage',
  title: 'JenkinsCoverage',
  pathPrefix: '/jenkins',
})
module.exports = t

t.create('jacoco: valid coverage')
  .get('/j/https/updates.jenkins-ci.org/job/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/jacoco/api/json?tree=instructionCoverage%5Bpercentage%5D'
      )
      .reply(200, {
        instructionCoverage: {
          percentage: 81,
        },
      })
  )
  .expectBadge({ label: 'coverage', message: '81%' })

t.create(
  'jacoco: valid coverage (badge URL without leading /job after Jenkins host)'
)
  .get('/j/https/updates.jenkins-ci.org/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/jacoco/api/json?tree=instructionCoverage%5Bpercentage%5D'
      )
      .reply(200, {
        instructionCoverage: {
          percentage: 81,
        },
      })
  )
  .expectBadge({ label: 'coverage', message: '81%' })

t.create('jacoco: invalid data response (no instructionCoverage object)')
  .get('/j/https/updates.jenkins-ci.org/job/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/jacoco/api/json?tree=instructionCoverage%5Bpercentage%5D'
      )
      .reply(200, {
        invalidCoverageObject: {
          percentage: 81,
        },
      })
  )
  .expectBadge({ label: 'coverage', message: 'invalid response data' })

t.create('jacoco: invalid data response (non numeric coverage)')
  .get('/j/https/updates.jenkins-ci.org/job/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/jacoco/api/json?tree=instructionCoverage%5Bpercentage%5D'
      )
      .reply(200, {
        instructionCoverage: {
          percentage: 'non-numeric',
        },
      })
  )
  .expectBadge({ label: 'coverage', message: 'invalid response data' })

t.create('jacoco: job not found')
  .get('/j/https/updates.jenkins-ci.org/job/does-not-exist.json')
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })

t.create('cobertura: valid coverage')
  .get('/c/https/updates.jenkins-ci.org/job/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/cobertura/api/json?tree=results%5Belements%5Bname%2Cratio%5D%5D'
      )
      .reply(200, {
        results: {
          elements: [
            {
              name: 'Conditionals',
              ratio: 95.146,
            },
            {
              name: 'Lines',
              ratio: 63.745,
            },
          ],
        },
      })
  )
  .expectBadge({ label: 'coverage', message: '64%' })

t.create(
  'cobertura: valid coverage (badge URL without leading /job after Jenkins host)'
)
  .get('/c/https/updates.jenkins-ci.org/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/cobertura/api/json?tree=results%5Belements%5Bname%2Cratio%5D%5D'
      )
      .reply(200, {
        results: {
          elements: [
            {
              name: 'Conditionals',
              ratio: 95.146,
            },
            {
              name: 'Lines',
              ratio: 63.745,
            },
          ],
        },
      })
  )
  .expectBadge({ label: 'coverage', message: '64%' })

t.create('cobertura: invalid data response (non-numeric coverage)')
  .get('/c/https/updates.jenkins-ci.org/job/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/cobertura/api/json?tree=results%5Belements%5Bname%2Cratio%5D%5D'
      )
      .reply(200, {
        results: {
          elements: [
            {
              name: 'Lines',
              ratio: 'non-numeric',
            },
          ],
        },
      })
  )
  .expectBadge({ label: 'coverage', message: 'invalid response data' })

t.create('cobertura: invalid data response (missing line coverage)')
  .get('/c/https/updates.jenkins-ci.org/job/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/cobertura/api/json?tree=results%5Belements%5Bname%2Cratio%5D%5D'
      )
      .reply(200, {
        results: {
          elements: [
            {
              name: 'Conditionals',
              ratio: 95.146,
            },
          ],
        },
      })
  )
  .expectBadge({ label: 'coverage', message: 'invalid response data' })

t.create('cobertura: job not found')
  .get('/c/https/updates.jenkins-ci.org/job/does-not-exist.json')
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })

t.create('cobertura: job found')
  .get('/c/https/builds.apache.org/job/olingo-odata4-cobertura.json')
  .timeout(10000)
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })
