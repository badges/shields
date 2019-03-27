'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('license (valid)')
  .get('/symfony/symfony.json')
  .expectBadge({ label: 'license', message: 'MIT' })

// note: packagist does serve up license at the version level
// but our endpoint only supports fetching license for the lastest version
t.create('license (invalid, package version in request)')
  .get('/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: '404', message: 'badge not found' })

t.create('license (invalid)')
  .get('/frodo/is-not-a-package.json')
  .expectBadge({ label: 'license', message: 'not found' })
