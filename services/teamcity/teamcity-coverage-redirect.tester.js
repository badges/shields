import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'TeamCityCoverageRedirect',
  title: 'TeamCityCoverageRedirect',
  pathPrefix: '/teamcity/coverage',
})

t.create('coverage')
  .get('/https/teamcity.jetbrains.com/ReactJSNet_PullRequests.svg')
  .expectRedirect(
    `/teamcity/coverage/ReactJSNet_PullRequests.svg?server=${encodeURIComponent(
      'https://teamcity.jetbrains.com'
    )}`
  )
