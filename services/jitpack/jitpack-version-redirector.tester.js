import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'JitpackVersionRedirect',
  title: 'JitpackVersionRedirect',
  pathPrefix: '/jitpack/v',
})

t.create('jitpack version deprecated (no vcs)')
  .get('/jitpack/maven-simple.json')
  .expectBadge({
    label: 'jitpack',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('jitpack version redirect (github)')
  .get('/github/jitpack/maven-simple.svg')
  .expectRedirect('/jitpack/version/com.github.jitpack/maven-simple.svg')
