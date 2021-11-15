import { ServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = new ServiceTester({ id: 'tokei', title: 'Tokei LOC Tests' })

t.create('GitHub LOC')
  .get('/lines/github/badges/shields.json')
  .expectBadge({ label: 'total lines', message: isMetric })

t.create('GitLab LOC')
  .get('/lines/gitlab/shields-ops-group/tag-test.json')
  .timeout(15000)
  .expectBadge({ label: 'total lines', message: isMetric })

t.create('GitHub LOC (with .com)')
  .get('/lines/github.com/badges/shields.json')
  .expectBadge({ label: 'total lines', message: isMetric })

t.create('GitLab LOC (with .com)')
  .get('/lines/gitlab.com/shields-ops-group/tag-test.json')
  .timeout(15000)
  .expectBadge({ label: 'total lines', message: isMetric })

t.create('BitBucket LOC')
  .get('/lines/bitbucket.org/MonliH/tokei-shields-test.json')
  .expectBadge({ label: 'total lines', message: isMetric })

t.create('Invalid Provider')
  .get('/lines/example/tezos/tezos.json')
  .expectBadge({ label: 'total lines', message: 'repo not found' })
