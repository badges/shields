import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({ id: 'libscore', title: 'libscore' })

t.create('no longer available (previously usage statistics)')
  .get('/s/jQuery.json')
  .expectBadge({
    label: 'libscore',
    message: 'no longer available',
  })
