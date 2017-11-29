'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
  isCommaSeperatedPythonVersions,
  isSemver,
} = require('./helpers/validators');

const t = new ServiceTester({ id: 'pypi', title: 'PyPi badges' });
module.exports = t;


/*
  Note:
  Download statistics are no longer available from pypi
  it is exptected that the download badges all show
  'no longer available'
*/
t.create('daily downloads (expected failure)')
  .get('/dd/djangorestframework.json')
  .expectJSONTypes({ name: 'downloads', value: 'no longer available' });

t.create('weekly downloads (expected failure)')
  .get('/dw/djangorestframework.json')
  .expectJSONTypes({ name: 'downloads', value: 'no longer available' });

t.create('monthly downloads (expected failure)')
  .get('/dm/djangorestframework.json')
  .expectJSONTypes({ name: 'downloads', value: 'no longer available' });

t.create('daily downloads (invalid)')
  .get('/dd/not-a-package.json')
  .expectJSONTypes({ name: 'pypi', value: 'invalid' });

t.create('weekly downloads (invalid)')
  .get('/dw/not-a-package.json')
  .expectJSONTypes({ name: 'pypi', value: 'invalid' });

t.create('monthly downloads (invalid)')
  .get('/dm/not-a-package.json')
  .expectJSONTypes({ name: 'pypi', value: 'invalid' });

/*
  Note:
  Not all project on PyPi follow SemVer

  Versions strings like
  - 2.7.3.2
  - 2.0rc1
  - 0.1.30b10
  are prefectly legal.

  We'll run this test againt a project that follows SemVer...
*/
t.create('version (semver)')
  .get('/v/requests.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'pypi',
    value: isSemver
  }));

/*
  ..whereas this project uses version numbers that
  should just be validated as an arbitary string
*/
t.create('version (not semver)')
  .get('/v/psycopg2.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'pypi',
    value: Joi.string()
  }));

t.create('version (invalid)')
  .get('/v/not-a-package.json')
  .expectJSONTypes({ name: 'pypi', value: 'invalid' });

t.create('licence (valid, package version in request)')
  .get('/l/requests/2.18.4.json')
  .expectJSONTypes({ name: 'license', value: 'Apache 2.0' });

t.create('licence (valid, no package version specified)')
  .get('/l/requests.json')
  .expectJSONTypes({ name: 'license', value: 'Apache 2.0' });

t.create('license (invalid)')
  .get('/l/not-a-package.json')
  .expectJSONTypes({ name: 'pypi', value: 'invalid' });

t.create('wheel (has wheel, package version in request)')
  .get('/wheel/requests/2.18.4.json')
  .expectJSONTypes({ name: 'wheel', value: 'yes' });

t.create('wheel (has wheel, no package version specified)')
  .get('/wheel/requests.json')
  .expectJSONTypes({ name: 'wheel', value: 'yes' });

t.create('wheel (no wheel)')
  .get('/wheel/chai/1.1.2.json')
  .expectJSONTypes({ name: 'wheel', value: 'no' });

t.create('wheel (invalid)')
  .get('/wheel/not-a-package.json')
  .expectJSONTypes({ name: 'pypi', value: 'invalid' });

t.create('format (wheel, package version in request)')
  .get('/format/requests/2.18.4.json')
  .expectJSONTypes({ name: 'format', value: 'wheel' });

t.create('format (wheel, no package version specified)')
  .get('/format/requests.json')
  .expectJSONTypes({ name: 'format', value: 'wheel' });

t.create('format (source)')
  .get('/format/chai/1.1.2.json')
  .expectJSONTypes({ name: 'format', value: 'source' });

t.create('format (egg)')
  .get('/format/virtualenv/0.8.2.json')
  .expectJSONTypes({ name: 'format', value: 'egg' });

t.create('format (invalid)')
  .get('/format/not-a-package.json')
  .expectJSONTypes({ name: 'pypi', value: 'invalid' });

t.create('python versions (valid, package version in request)')
  .get('/pyversions/requests/2.18.4.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'python',
    value: isCommaSeperatedPythonVersions
  }));

t.create('python versions (valid, no package version specified)')
  .get('/pyversions/requests.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'python',
    value: isCommaSeperatedPythonVersions
  }));

t.create('python versions (no versions specified)')
  .get('/pyversions/pyshp/1.2.12.json')
  .expectJSONTypes({ name: 'python', value: 'not found' });

t.create('python versions (invalid)')
  .get('/pyversions/not-a-package.json')
  .expectJSONTypes({ name: 'pypi', value: 'invalid' });

t.create('implementation (valid, package version in request)')
  .get('/implementation/beehive/1.0.json')
  .expectJSONTypes({ name: 'implementation', value: 'cpython, jython, pypy' });

t.create('implementation (valid, no package version specified)')
  .get('/implementation/numpy.json')
  .expectJSONTypes({ name: 'implementation', value: 'cpython' });

t.create('implementation (not specified)')
  .get('/implementation/chai/1.1.2.json')
  .expectJSONTypes({ name: 'implementation', value: 'cpython' });

t.create('implementation (invalid)')
  .get('/implementation/not-a-package.json')
  .expectJSONTypes({ name: 'pypi', value: 'invalid' });

t.create('status (valid, stable, package version in request)')
  .get('/status/django/1.11.json')
  .expectJSONTypes({name: 'status', value: 'stable' });

t.create('status (valid, no package version specified)')
  .get('/status/typing.json')
  .expectJSONTypes({name: 'status', value: 'stable' });

t.create('status (valid, beta)')
  .get('/status/django/2.0rc1.json')
  .expectJSONTypes({ name: 'status', value: 'beta' });

t.create('status (invalid)')
  .get('/status/not-a-package.json')
  .expectJSONTypes({ name: 'pypi', value: 'invalid' });
