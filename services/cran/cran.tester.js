'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const { isVPlusTripleDottedVersion } = require('../test-validators');

const t = new ServiceTester({ id: 'cran', title: 'CRAN/METACRAN' });
module.exports = t;

t.create('version')
  .get('/v/devtools.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'cran',
    value: isVPlusTripleDottedVersion
  }));

t.create('specified license')
  .get('/l/devtools.json')
  .expectJSON({ name: 'license', value: 'GPL (>= 2)' });

t.create('unknown package')
  .get('/l/some-bogus-package.json')
  .expectJSON({ name: 'cran', value: 'not found' });

t.create('unknown info')
  .get('/z/devtools.json')
  .expectStatus(404)
  .expectJSON({ name: '404', value: 'badge not found' });

t.create('malformed response')
  .get('/v/foobar.json')
  .intercept(nock => nock('http://crandb.r-pkg.org')
    .get('/foobar')
    .reply(200))  // JSON without Version.
  .expectJSON({ name: 'cran', value: 'invalid' });

t.create('connection error')
  .get('/v/foobar.json')
  .networkOff()
  .expectJSON({ name: 'cran', value: 'inaccessible' });

t.create('unspecified license')
  .get('/l/foobar.json')
  .intercept(nock => nock('http://crandb.r-pkg.org')
    .get('/foobar')
    .reply(200, {}))  // JSON without License.
  .expectJSON({ name: 'license', value: 'unknown' });
