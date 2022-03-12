import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'shippable',
  title: 'Shippable',
})

t.create('no longer available (previously build status with branch)')
  .get('/5444c5ecb904a4b21567b0ff/master.json')
  .expectBadge({
    label: 'shippable',
    message: 'no longer available',
  })

t.create('no longer available (previously build status without branch)')
  .get('/5444c5ecb904a4b21567b0ff.json')
  .expectBadge({
    label: 'shippable',
    message: 'no longer available',
  })
