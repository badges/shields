'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const { isVPlusTripleDottedVersion } = require('../test-validators');
const { invalidJSON } = require('../response-fixtures');

const t = new ServiceTester({ id: 'cdnjs', title: 'CDNJs' });
module.exports = t;


t.create('cdnjs (valid)')
  .get('/v/jquery.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'cdnjs',
    value: isVPlusTripleDottedVersion,
  }));

t.create('cdnjs (not found)')
  .get('/v/not-a-library.json')
  .expectJSON({name: 'cdnjs', value: 'not found'});

t.create('cdnjs (connection error)')
  .get('/v/jquery.json')
  .networkOff()
  .expectJSON({name: 'cdnjs', value: 'inaccessible'});

t.create('cdnjs (unexpected response)')
  .get('/v/jquery.json')
  .intercept(nock => nock('https://api.cdnjs.com')
    .get('/libraries/jquery?fields=version')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'cdnjs', value: 'invalid'});

t.create('cdnjs (error response)')
  .get('/v/jquery.json')
  .intercept(nock => nock('https://api.cdnjs.com')
    .get('/libraries/jquery?fields=version')
    .reply(500, '{"error":"oh noes!!"}')
  )
  .expectJSON({name: 'cdnjs', value: 'invalid'});
