'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'TeamCityCoverageRedirect',
  title: 'TeamCityCoverageRedirect',
  pathPrefix: '/teamcity/coverage',
}))

t.create('coverage')
  .get('/https/teamcity.jetbrains.com/ReactJSNet_PullRequests.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/teamcity/coverage/ReactJSNet_PullRequests.svg?server=${encodeURIComponent(
      'https://teamcity.jetbrains.com'
    )}`
  )
