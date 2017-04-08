'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester('CRAN', '/cran');
module.exports = t;

t.create('version')
  .get('/v/devtools.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('cran'),
    value: Joi.string().regex(/^v\d+\.\d+\.\d+$/)
  }));

t.create('specified license')
  .get('/l/devtools.json')
  .expectJSON({ name: 'license', value: 'GPL (>= 2)' });

t.create('unknown package')
  .get('/l/some-bogus-package.json')
  .expectJSON({ name: 'cran', value: 'not found' });

// Needs https://github.com/badges/shields/pull/922
// tester.create('unknown info')
//   .get('/z/devtools.json')
//   .expectStatus(404)
//   .expectJSON({ name: 'badge', value: 'not found' });

t.create('malformed response')
  .get('/v/foobar.json')
  .intercept(nock => nock('http://crandb.r-pkg.org')
    .get('/foobar')
    .reply(200))
  .expectJSON({ name: 'cran', value: 'invalid' });

t.create('connection error')
  .get('/v/foobar.json')
  .intercept(nock => nock('http://crandb.r-pkg.org')
    .get('/foobar')
    .replyWithError({ code: 'ECONNRESET' }))
  .expectJSON({ name: 'cran', value: 'inaccessible' });

t.create('unspecified license')
  .get('/l/foobar.json')
  // JSON without License.
  .intercept(nock => nock('http://crandb.r-pkg.org')
    .get('/foobar')
    .reply(200, {}))
  .expectJSON({ name: 'license', value: 'unknown' });
