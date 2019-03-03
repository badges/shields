'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
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
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('weekly downloads (valid)')
  .get('/dw/djangorestframework.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('monthly downloads (valid)')
  .get('/dm/djangorestframework.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('downloads (mixed-case package name)')
  .get('/dd/DjangoRestFramework.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('daily downloads (not found)')
  .get('/dd/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'package not found' })

t.create('weekly downloads (not found)')
  .get('/dw/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'package not found' })

t.create('monthly downloads (not found)')
  .get('/dm/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'package not found' })

/*
  tests for version endpoint

  Note:
  Not all project on PyPi follow SemVer

  Versions strings like
  - 2.7.3.2
  - 2.0rc1
  - 0.1.30b10
  are perfectly legal.

  We'll run this test against a project that follows SemVer...
*/
t.create('version (semver)')
  .get('/v/requests.json')
  .expectBadge({
    label: 'pypi',
    message: isSemver,
  })

// ..whereas this project does not folow SemVer
t.create('version (not semver)')
  .get('/v/psycopg2.json')
  .expectBadge({
    label: 'pypi',
    message: isPsycopg2Version,
  })

t.create('version (invalid)')
  .get('/v/not-a-package.json')
  .expectBadge({ label: 'pypi', message: 'package or version not found' })

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
  .expectBadge({
    label: 'pypi',
    message: 'v1.2.3',
  })

// tests for license endpoint

t.create('license (valid, package version in request)')
  .get('/l/requests/2.18.4.json')
  .expectBadge({ label: 'license', message: 'Apache 2.0' })

t.create('license (valid, no package version specified)')
  .get('/l/requests.json')
  .expectBadge({ label: 'license', message: 'Apache 2.0' })

t.create('license (invalid)')
  .get('/l/not-a-package.json')
  .expectBadge({ label: 'license', message: 'package or version not found' })

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
  .expectBadge({
    label: 'license',
    message: 'mit license',
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
  .expectBadge({
    label: 'license',
    message: 'GPL',
  })

// tests for wheel endpoint

t.create('wheel (has wheel, package version in request)')
  .get('/wheel/requests/2.18.4.json')
  .expectBadge({ label: 'wheel', message: 'yes' })

t.create('wheel (has wheel, no package version specified)')
  .get('/wheel/requests.json')
  .expectBadge({ label: 'wheel', message: 'yes' })

t.create('wheel (no wheel)')
  .get('/wheel/chai/1.1.2.json')
  .expectBadge({ label: 'wheel', message: 'no' })

t.create('wheel (invalid)')
  .get('/wheel/not-a-package.json')
  .expectBadge({ label: 'wheel', message: 'package or version not found' })

// tests for format endpoint

t.create('format (wheel, package version in request)')
  .get('/format/requests/2.18.4.json')
  .expectBadge({ label: 'format', message: 'wheel' })

t.create('format (wheel, no package version specified)')
  .get('/format/requests.json')
  .expectBadge({ label: 'format', message: 'wheel' })

t.create('format (source)')
  .get('/format/chai/1.1.2.json')
  .expectBadge({ label: 'format', message: 'source' })

t.create('format (egg)')
  .get('/format/virtualenv/0.8.2.json')
  .expectBadge({ label: 'format', message: 'egg' })

t.create('format (invalid)')
  .get('/format/not-a-package.json')
  .expectBadge({ label: 'format', message: 'package or version not found' })

// tests for pyversions endpoint

t.create('python versions (valid, package version in request)')
  .get('/pyversions/requests/2.18.4.json')
  .expectBadge({
    label: 'python',
    message: isPipeSeparatedPythonVersions,
  })

t.create('python versions (valid, no package version specified)')
  .get('/pyversions/requests.json')
  .expectBadge({
    label: 'python',
    message: isPipeSeparatedPythonVersions,
  })

t.create('python versions ("Only" and others)')
  .get('/pyversions/uvloop/0.12.1.json')
  .expectBadge({ label: 'python', message: '3.5 | 3.6 | 3.7' })

t.create('python versions ("Only" only)')
  .get('/pyversions/hashpipe/0.9.1.json')
  .expectBadge({ label: 'python', message: '3' })

t.create('python versions (no versions specified)')
  .get('/pyversions/pyshp/1.2.12.json')
  .expectBadge({ label: 'python', message: 'missing' })

t.create('python versions (invalid)')
  .get('/pyversions/not-a-package.json')
  .expectBadge({ label: 'python', message: 'package or version not found' })

// tests for django versions endpoint

t.create('supported django versions (valid, package version in request)')
  .get('/djversions/djangorestframework/3.7.3.json')
  .expectBadge({
    label: 'django versions',
    message: isPipeSeparatedDjangoVersions,
  })

t.create('supported django versions (valid, no package version specified)')
  .get('/djversions/djangorestframework.json')
  .expectBadge({
    label: 'django versions',
    message: isPipeSeparatedDjangoVersions,
  })

t.create('supported django versions (no versions specified)')
  .get('/djversions/django/1.11.json')
  .expectBadge({ label: 'django versions', message: 'missing' })

t.create('supported django versions (invalid)')
  .get('/djversions/not-a-package.json')
  .expectBadge({
    label: 'django versions',
    message: 'package or version not found',
  })

// tests for implementation endpoint

t.create('implementation (valid, package version in request)')
  .get('/implementation/beehive/1.0.json')
  .expectBadge({ label: 'implementation', message: 'cpython | jython | pypy' })

t.create('implementation (valid, no package version specified)')
  .get('/implementation/numpy.json')
  .expectBadge({ label: 'implementation', message: 'cpython' })

t.create('implementation (not specified)')
  .get('/implementation/chai/1.1.2.json')
  .expectBadge({ label: 'implementation', message: 'cpython' })

t.create('implementation (invalid)')
  .get('/implementation/not-a-package.json')
  .expectBadge({
    label: 'implementation',
    message: 'package or version not found',
  })

// tests for status endpoint

t.create('status (valid, stable, package version in request)')
  .get('/status/django/1.11.json')
  .expectBadge({ label: 'status', message: 'stable' })

t.create('status (valid, no package version specified)')
  .get('/status/typing.json')
  .expectBadge({ label: 'status', message: 'stable' })

t.create('status (valid, beta)')
  .get('/status/django/2.0rc1.json')
  .expectBadge({ label: 'status', message: 'beta' })

t.create('status (invalid)')
  .get('/status/not-a-package.json')
  .expectBadge({ label: 'status', message: 'package or version not found' })
