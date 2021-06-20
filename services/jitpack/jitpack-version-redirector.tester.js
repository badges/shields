import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'JitpackVersionRedirect',
  title: 'JitpackVersionRedirect',
  pathPrefix: '/jitpack/v',
})

t.create('jitpack version redirect')
  .get('/jitpack/maven-simple.svg')
  .expectRedirect('/jitpack/v/github/jitpack/maven-simple.svg')
