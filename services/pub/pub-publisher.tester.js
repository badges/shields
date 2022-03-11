import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'PubPublisher',
  title: 'Pub Publisher',
  pathPrefix: '/pub',
})

t.create('package publisher').get('/publisher/path.json').expectBadge({
  label: 'publisher',
  message: 'dart.dev',
})

t.create('package not verified publisher')
  .get('/publisher/utf.json')
  .expectBadge({
    label: 'publisher',
    message: 'unverified',
    color: 'red',
  })

t.create('package not found')
  .get('/publisher/does-not-exist.json')
  .expectBadge({
    label: 'publisher',
    message: 'not found',
  })
