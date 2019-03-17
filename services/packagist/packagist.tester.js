'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const {
  isComposerVersion,
  isMetric,
  isMetricOverTimePeriod,
} = require('../test-validators')

/*
  validator for a packagist version number

  From https://packagist.org/about :
  "version names should match 'X.Y.Z', or 'vX.Y.Z',
  with an optional suffix for RC, beta, alpha or patch versions"
*/
const isPackagistVersion = Joi.string().regex(/^v?[0-9]+.[0-9]+.[0-9]+[\S]*$/)

const t = (module.exports = new ServiceTester({
  id: 'packagist',
  title: 'PHP version from Packagist',
}))

// tests for php version support endpoint

t.create('gets the package version of symfony')
  .get('/php-v/symfony/symfony.json')
  .expectBadge({ label: 'php', message: isComposerVersion })

t.create('gets the package version of symfony 2.8')
  .get('/php-v/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: 'php', message: isComposerVersion })

t.create('invalid package name')
  .get('/php-v/frodo/is-not-a-package.json')
  .expectBadge({ label: 'php', message: 'not found' })

// tests for download stats endpoints

t.create('daily downloads (valid, no package version specified)')
  .get('/dd/doctrine/orm.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('monthly downloads (valid, no package version specified)')
  .get('/dm/doctrine/orm.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('total downloads (valid, no package version specified)')
  .get('/dt/doctrine/orm.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

// note: packagist can't give us download stats for a specific version
t.create('daily downloads (invalid, package version specified)')
  .get('/dd/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: '404', message: 'badge not found' })

t.create('monthly downloads (invalid, package version in request)')
  .get('/dm/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: '404', message: 'badge not found' })

t.create('total downloads (invalid, package version in request)')
  .get('/dt/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: '404', message: 'badge not found' })

t.create('daily downloads (invalid package name)')
  .get('/dd/frodo/is-not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('monthly downloads (invalid package name)')
  .get('/dm/frodo/is-not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('total downloads (invalid package name)')
  .get('/dt/frodo/is-not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

// tests for version endpoint

t.create('version (valid)')
  .get('/v/symfony/symfony.json')
  .expectBadge({
    label: 'packagist',
    message: isPackagistVersion,
  })

t.create('version (invalid package name)')
  .get('/v/frodo/is-not-a-package.json')
  .expectBadge({ label: 'packagist', message: 'not found' })

// tests for license endpoint

t.create('license (valid)')
  .get('/l/symfony/symfony.json')
  .expectBadge({ label: 'license', message: 'MIT' })

// note: packagist does serve up license at the version level
// but our endpoint only supports fetching license for the lastest version
t.create('license (invalid, package version in request)')
  .get('/l/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: '404', message: 'badge not found' })

t.create('license (invalid)')
  .get('/l/frodo/is-not-a-package.json')
  .expectBadge({ label: 'license', message: 'not found' })
