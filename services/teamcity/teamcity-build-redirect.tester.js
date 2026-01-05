import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'TeamCityBuildRedirect',
  title: 'TeamCityBuildRedirect',
  pathPrefix: '/teamcity',
})

t.create('codebetter')
  .get('/codebetter/IntelliJIdeaCe_JavaDecompilerEngineTests.json')
  .expectBadge({
    label: 'teamcity',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('hostAndPath simple build')
  .get('/https/teamcity.jetbrains.com/s/bt345.svg')
  .expectRedirect(
    `/teamcity/build/s/bt345.svg?server=${encodeURIComponent(
      'https://teamcity.jetbrains.com',
    )}`,
  )

t.create('hostAndPath full build')
  .get('/https/teamcity.jetbrains.com/e/bt345.svg')
  .expectRedirect(
    `/teamcity/build/e/bt345.svg?server=${encodeURIComponent(
      'https://teamcity.jetbrains.com',
    )}`,
  )
