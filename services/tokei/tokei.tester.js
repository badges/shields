'use strict'

const { ServiceTester } = require('../tester')
const { isMetric } = require('../test-validators')

const t = new ServiceTester({ id: 'tokei', title: 'Tokei LOC Tests' })
module.exports = t

t.create('GitHub LOC')
  .get('/lines/github/badges/shields.json')
  .expectBadge({ label: 'total lines', message: isMetric })

t.create('GitLab LOC')
  .get('/lines/gitlab/tezos/tezos.json')
  .expectBadge({ label: 'total lines', message: isMetric })

t.create('GitHub LOC (with .com)')
  .get('/lines/github.com/badges/shields.json')
  .expectBadge({ label: 'total lines', message: isMetric })

t.create('GitLab LOC (with .com)')
  .get('/lines/gitlab.com/tezos/tezos.json')
  .expectBadge({ label: 'total lines', message: isMetric })

t.create('BitBucket LOC')
  .get('/lines/bitbucket.org/MonliH/tokei-shields-test.json')
  .expectBadge({ label: 'total lines', message: isMetric })

t.create('Invalid Provider')
  .get('/lines/example/tezos/tezos.json')
  .expectBadge({ label: 'total lines', message: 'repo not found' })
