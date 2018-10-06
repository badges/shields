'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isMetricOverTimePeriod, isSemver } = require('../test-validators')

const isPsycopg2Version = Joi.string().regex(/^v([0-9][.]?)+$/)

// These regexes are the same, but declared separately for clarity.
const isPipeSeparatedPythonVersions = Joi.string().regex(
  /^([0-9]+\.[0-9]+(?: \| )?)+$/
)
const isPipeSeparatedDjangoVersions = isPipeSeparatedPythonVersions

const t = new ServiceTester({ id: 'pypi', title: 'PyPi badges' })
module.exports = t

// tests for downloads endpoints

t.create('daily downloads (valid)')
  .get('/dd/djangorestframework.json')
  .expectJSONTypes({ name: 'downloads', value: isMetricOverTimePeriod })

t.create('weekly downloads (valid)')
  .get('/dw/djangorestframework.json')
  .expectJSONTypes({ name: 'downloads', value: isMetricOverTimePeriod })

t.create('monthly downloads (valid)')
  .get('/dm/djangorestframework.json')
  .expectJSONTypes({ name: 'downloads', value: isMetricOverTimePeriod })

t.create('downloads (mixed-case package name)')
  .get('/dd/DjangoRestFramework.json')
  .expectJSONTypes({ name: 'downloads', value: isMetricOverTimePeriod })

t.create('daily downloads (not found)')
  .get('/dd/not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'package not found' })

t.create('weekly downloads (not found)')
  .get('/dw/not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'package not found' })

t.create('monthly downloads (not found)')
  .get('/dm/not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'package not found' })

/*
  tests for version endpoint

  Note:
  Not all project on PyPi follow SemVer

  Versions strings like
  - 2.7.3.2
  - 2.0rc1
  - 0.1.30b10
  are perfectly legal.

  We'll run this test againt a project that follows SemVer...
*/
t.create('version (semver)')
  .get('/v/requests.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pypi',
      value: isSemver,
    })
  )

// ..whereas this project does not folow SemVer
t.create('version (not semver)')
  .get('/v/psycopg2.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pypi',
      value: isPsycopg2Version,
    })
  )

t.create('version (invalid)')
  .get('/v/not-a-package.json')
  .expectJSON({ name: 'pypi', value: 'package or version not found' })

t.create('no trove classifiers')
  .get('/v/mapi.json')
  .intercept(nock =>
    nock('https://pypi.org')
      .get('/pypi/mapi/json')
      .reply(200, {
        info: {
          version: '1.2.3',
          license: 'foo',
          classifiers: [],
        },
        releases: {},
      })
  )
  .expectJSON({
    name: 'pypi',
    value: 'v1.2.3',
  })

// tests for license endpoint

t.create('license (valid, package version in request)')
  .get('/l/requests/2.18.4.json')
  .expectJSON({ name: 'license', value: 'Apache 2.0' })

t.create('license (valid, no package version specified)')
  .get('/l/requests.json')
  .expectJSON({ name: 'license', value: 'Apache 2.0' })

t.create('license (invalid)')
  .get('/l/not-a-package.json')
  .expectJSON({ name: 'license', value: 'package or version not found' })

t.create('license (from trove classifier)')
  .get('/l/mapi.json')
  .intercept(nock =>
    nock('https://pypi.org')
      .get('/pypi/mapi/json')
      .reply(200, {
        info: {
          version: '1.2.3',
          license: '',
          classifiers: ['License :: OSI Approved :: MIT License'],
        },
        releases: {},
      })
  )
  .expectJSON({
    name: 'license',
    value: 'mit license',
  })

t.create('license (as acronym from trove classifier)')
  .get('/l/magma.json')
  .intercept(nock =>
    nock('https://pypi.org')
      .get('/pypi/magma/json')
      .reply(200, {
        info: {
          version: '1.2.3',
          license: '',
          classifiers: [
            'License :: OSI Approved :: GNU General Public License (GPL)',
          ],
        },
        releases: {},
      })
  )
  .expectJSON({
    name: 'license',
    value: 'GPL',
  })

// tests for wheel endpoint

t.create('wheel (has wheel, package version in request)')
  .get('/wheel/requests/2.18.4.json')
  .expectJSON({ name: 'wheel', value: 'yes' })

t.create('wheel (has wheel, no package version specified)')
  .get('/wheel/requests.json')
  .expectJSON({ name: 'wheel', value: 'yes' })

t.create('wheel (no wheel)')
  .get('/wheel/chai/1.1.2.json')
  .expectJSON({ name: 'wheel', value: 'no' })

t.create('wheel (invalid)')
  .get('/wheel/not-a-package.json')
  .expectJSON({ name: 'wheel', value: 'package or version not found' })

// tests for format endpoint

t.create('format (wheel, package version in request)')
  .get('/format/requests/2.18.4.json')
  .expectJSON({ name: 'format', value: 'wheel' })

t.create('format (wheel, no package version specified)')
  .get('/format/requests.json')
  .expectJSON({ name: 'format', value: 'wheel' })

t.create('format (source)')
  .get('/format/chai/1.1.2.json')
  .expectJSON({ name: 'format', value: 'source' })

t.create('format (egg)')
  .get('/format/virtualenv/0.8.2.json')
  .expectJSON({ name: 'format', value: 'egg' })

t.create('format (invalid)')
  .get('/format/not-a-package.json')
  .expectJSON({ name: 'format', value: 'package or version not found' })

// tests for pyversions endpoint

t.create('python versions (valid, package version in request)')
  .get('/pyversions/requests/2.18.4.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'python',
      value: isPipeSeparatedPythonVersions,
    })
  )

t.create('python versions (valid, no package version specified)')
  .get('/pyversions/requests.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'python',
      value: isPipeSeparatedPythonVersions,
    })
  )

t.create('python versions (no versions specified)')
  .get('/pyversions/pyshp/1.2.12.json')
  .expectJSON({ name: 'python', value: 'missing' })

t.create('python versions (invalid)')
  .get('/pyversions/not-a-package.json')
  .expectJSON({ name: 'python', value: 'package or version not found' })

// tests for django versions endpoint

t.create('supported django versions (valid, package version in request)')
  .get('/djversions/djangorestframework/3.7.3.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'django versions',
      value: isPipeSeparatedDjangoVersions,
    })
  )

t.create('supported django versions (valid, no package version specified)')
  .get('/djversions/djangorestframework.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'django versions',
      value: isPipeSeparatedDjangoVersions,
    })
  )

t.create('supported django versions (no versions specified)')
  .get('/djversions/django/1.11.json')
  .expectJSON({ name: 'django versions', value: 'missing' })

t.create('supported django versions (invalid)')
  .get('/djversions/not-a-package.json')
  .expectJSON({
    name: 'django versions',
    value: 'package or version not found',
  })

// tests for implementation endpoint

t.create('implementation (valid, package version in request)')
  .get('/implementation/beehive/1.0.json')
  .expectJSON({ name: 'implementation', value: 'cpython | jython | pypy' })

t.create('implementation (valid, no package version specified)')
  .get('/implementation/numpy.json')
  .expectJSON({ name: 'implementation', value: 'cpython' })

t.create('implementation (not specified)')
  .get('/implementation/chai/1.1.2.json')
  .expectJSON({ name: 'implementation', value: 'cpython' })

t.create('implementation (invalid)')
  .get('/implementation/not-a-package.json')
  .expectJSON({ name: 'implementation', value: 'package or version not found' })

// tests for status endpoint

t.create('status (valid, stable, package version in request)')
  .get('/status/django/1.11.json')
  .expectJSON({ name: 'status', value: 'stable' })

t.create('status (valid, no package version specified)')
  .get('/status/typing.json')
  .expectJSON({ name: 'status', value: 'stable' })

t.create('status (valid, beta)')
  .get('/status/django/2.0rc1.json')
  .expectJSON({ name: 'status', value: 'beta' })

t.create('status (invalid)')
  .get('/status/not-a-package.json')
  .expectJSON({ name: 'status', value: 'package or version not found' })
