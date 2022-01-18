import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'feedz',
  title: 'Feedz',
  pathPrefix: '',
})

// The `shieldstests/public` repo is specifically made for these tests. It contains following packages:
//  - Shields.NoV1: 0.1.0
//  - Shields.TestPackage: 0.0.1, 0.1.0-pre, 1.0.0
//  - Shields.TestPreOnly: 0.1.0-pre
//  - Shields.MultiPage: 0.1.0-0.1.100 plus 1.0.0 but the response has multiple top-level `items`
//  - Shields.MultiPageNoItems: 0.0.0-0.0.256 plus 1.0.0 but the response has multiple top-level
//    `items` without `catalogEntries`
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

t.create('multi-page')
  .get('/feedz/v/shieldstests/public/Shields.MultiPage.json')
  .expectBadge({
    label: 'feedz',
    message: 'v1.0.0',
    color: 'blue',
  })

t.create('multi-page-no-items')
  .get('/feedz/v/shieldstests/public/Shields.MultiPageNoItems.json')
  .expectBadge({
    label: 'feedz',
    message: 'v1.0.0',
    color: 'blue',
  })

t.create('repository (not found)')
  .get('/feedz/v/foo/bar/not-a-real-package.json')
  .expectBadge({ label: 'feedz', message: 'repository or package not found' })

t.create('version (not found)')
  .get('/feedz/v/shieldstests/public/not-a-real-package.json')
  .expectBadge({ label: 'feedz', message: 'repository or package not found' })

t.create('non-existing repository')
  .get('/feedz/v/shieldstests/does-not-exist/Shields.TestPackage.json')
  .expectBadge({ label: 'feedz', message: 'repository or package not found' })

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

t.create('multi-page (pre)')
  .get('/feedz/vpre/shieldstests/public/Shields.MultiPage.json')
  .expectBadge({
    label: 'feedz',
    message: 'v1.0.0',
    color: 'blue',
  })

t.create('repository (pre) (not found)')
  .get('/feedz/vpre/foo/bar/not-a-real-package.json')
  .expectBadge({ label: 'feedz', message: 'repository or package not found' })

t.create('version (pre) (not found)')
  .get('/feedz/vpre/shieldstests/public/not-a-real-package.json')
  .expectBadge({ label: 'feedz', message: 'repository or package not found' })

t.create('non-existing repository')
  .get('/feedz/vpre/shieldstests/does-not-exist/Shields.TestPackage.json')
  .expectBadge({ label: 'feedz', message: 'repository or package not found' })
