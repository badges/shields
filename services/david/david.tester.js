import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'david',
  title: 'David',
})

t.create('no longer available (previously dependencies)')
  .get('/expressjs/express.json')
  .expectBadge({
    label: 'david',
    message: 'no longer available',
  })

t.create('no longer available (previously dev dependencies)')
  .get('/dev/expressjs/express.json')
  .expectBadge({
    label: 'david',
    message: 'no longer available',
  })
