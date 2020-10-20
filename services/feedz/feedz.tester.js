'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'feedz',
  title: 'Feedz',
  pathPrefix: '',
}))

// The `shieldstests/public` repo is specifically made for these tests. It contains following packages:
//  - Shields.NoV1: 0.1.0
//  - Shields.TestPackage: 0.0.1, 0.1.0-pre, 1.0.0
//  - Shields.TestPreOnly: 0.1.0-pre
// The source code of these packages is here: https://github.com/jakubfijalkowski/shields-test-packages

// version
t.create('version (valid)')
  .get('/feedz/v/shieldstests/public/Shields.TestPackage.json')
  .expectBadge({
    label: 'feedz',
    message: 'v1.0.0',
    color: 'blue',
  })

t.create('version (yellow badge)')
  .get('/feedz/v/shieldstests/public/Shields.TestPreOnly.json')
  .expectBadge({
    label: 'feedz',
    message: 'v0.1.0-pre',
    color: 'yellow',
  })

t.create('version (orange badge)')
  .get('/feedz/v/shieldstests/public/Shields.NoV1.json')
  .expectBadge({
    label: 'feedz',
    message: 'v0.1.0',
    color: 'orange',
  })

t.create('repository (not found)')
  .get('/feedz/v/foo/bar/not-a-real-package.json')
  .expectBadge({ label: 'feedz', message: 'not found' })

t.create('version (not found)')
  .get('/feedz/v/shieldstests/public/not-a-real-package.json')
  .expectBadge({ label: 'feedz', message: 'not found' })

// version (pre)
t.create('version (pre) (valid)')
  .get('/feedz/vpre/shieldstests/public/Shields.TestPackage.json')
  .expectBadge({
    label: 'feedz',
    message: 'v1.0.0',
    color: 'blue',
  })

t.create('version (pre) (yellow badge)')
  .get('/feedz/vpre/shieldstests/public/Shields.TestPreOnly.json')
  .expectBadge({
    label: 'feedz',
    message: 'v0.1.0-pre',
    color: 'yellow',
  })

t.create('version (pre) (orange badge)')
  .get('/feedz/vpre/shieldstests/public/Shields.NoV1.json')
  .expectBadge({
    label: 'feedz',
    message: 'v0.1.0',
    color: 'orange',
  })

t.create('repository (pre) (not found)')
  .get('/feedz/vpre/foo/bar/not-a-real-package.json')
  .expectBadge({ label: 'feedz', message: 'not found' })

t.create('version (pre) (not found)')
  .get('/feedz/vpre/shieldstests/public/not-a-real-package.json')
  .expectBadge({ label: 'feedz', message: 'not found' })
