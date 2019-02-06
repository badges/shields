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
  .expectJSONTypes(Joi.object().keys({ name: 'php', value: isComposerVersion }))

t.create('gets the package version of symfony 2.8')
  .get('/php-v/symfony/symfony/v2.8.0.json')
  .expectJSONTypes(Joi.object().keys({ name: 'php', value: isComposerVersion }))

t.create('invalid package name')
  .get('/php-v/frodo/is-not-a-package.json')
  .expectJSON({ name: 'php', value: 'invalid' })

// tests for download stats endpoints

t.create('daily downloads (valid, no package version specified)')
  .get('/dd/doctrine/orm.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('monthly downloads (valid, no package version specified)')
  .get('/dm/doctrine/orm.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('total downloads (valid, no package version specified)')
  .get('/dt/doctrine/orm.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

// note: packagist can't give us download stats for a specific version
t.create('daily downloads (invalid, package version specified)')
  .get('/dd/symfony/symfony/v2.8.0.json')
  .expectJSON({ name: 'downloads', value: 'invalid' })

t.create('monthly downloads (invalid, package version in request)')
  .get('/dm/symfony/symfony/v2.8.0.json')
  .expectJSON({ name: 'downloads', value: 'invalid' })

t.create('total downloads (invalid, package version in request)')
  .get('/dt/symfony/symfony/v2.8.0.json')
  .expectJSON({ name: 'downloads', value: 'invalid' })

t.create('daily downloads (invalid package name)')
  .get('/dd/frodo/is-not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'invalid' })

t.create('monthly downloads (invalid package name)')
  .get('/dm/frodo/is-not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'invalid' })

t.create('total downloads (invalid package name)')
  .get('/dt/frodo/is-not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'invalid' })

// tests for version endpoint

t.create('version (valid)')
  .get('/v/symfony/symfony.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'packagist',
      value: isPackagistVersion,
    })
  )

t.create('version (invalid package name)')
  .get('/v/frodo/is-not-a-package.json')
  .expectJSON({ name: 'packagist', value: 'invalid' })

// tests for license endpoint

t.create('license (valid)')
  .get('/l/symfony/symfony.json')
  .expectJSON({ name: 'license', value: 'MIT' })

// note: packagist does serve up license at the version level
// but our endpoint only supports fetching license for the lastest version
t.create('license (invalid, package version in request)')
  .get('/l/symfony/symfony/v2.8.0.json')
  .expectJSON({ name: 'license', value: 'invalid' })

t.create('license (invalid)')
  .get('/l/frodo/is-not-a-package.json')
  .expectJSON({ name: 'license', value: 'invalid' })
