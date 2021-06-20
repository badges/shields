import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'gemnasium',
  title: 'gemnasium',
})

t.create('no longer available (previously dependencies)')
  .get('/mathiasbynens/he.json')
  .expectBadge({
    label: 'gemnasium',
    message: 'no longer available',
  })
