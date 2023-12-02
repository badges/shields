import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({ id: 'tokei', title: 'Tokei LOC Tests' })

t.create('GitHub LOC')
  .get('/lines/github/badges/shields.json')
  .expectBadge({ label: 'tokei', message: 'no longer available' })

t.create('BitBucket LOC')
  .get('/lines/bitbucket.org/MonliH/tokei-shields-test.json')
  .expectBadge({ label: 'tokei', message: 'no longer available' })
