import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'microbadger',
  title: 'Microbadger',
})

t.create('no longer available (previously image size)')
  .get('/image-size/fedora/apache.json')
  .expectBadge({
    label: 'microbadger',
    message: 'no longer available',
  })

t.create('no longer available (previously image size with tag)')
  .get('/image-size/fedora/apache/latest.json')
  .expectBadge({
    label: 'microbadger',
    message: 'no longer available',
  })

t.create('no longer available (previously layers)')
  .get('/layers/fedora/apache.json')
  .expectBadge({
    label: 'microbadger',
    message: 'no longer available',
  })

t.create('no longer available (previously layers with tag)')
  .get('/layers/fedora/apache/latest.json')
  .expectBadge({
    label: 'microbadger',
    message: 'no longer available',
  })
