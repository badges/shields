import {ServiceTester} from '../tester.js';

export const t = new ServiceTester({
  id: 'JitPackDownloads',
  title: 'JitPackDownloads',
  pathPrefix: '/jitpack',
})

t.create('no longer available (dw)')
  .get('/dw/github/jitpack/maven-simple.json')
  .expectBadge({
    label: 'jitpack',
    message: 'no longer available',
  })

t.create('no longer available (dm)')
  .get('/dm/github/jitpack/maven-simple.json')
  .expectBadge({
    label: 'jitpack',
    message: 'no longer available',
  })
