'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');

const t = new ServiceTester({ id: 'bitrise', title: 'Bitrise' });
module.exports = t;

t.create('deploy status')
  .get('/cde737473028420d/master.json?token=GCIdEzacE4GW32jLVrZb7A')
  .expectJSONTypes(Joi.object().keys({
    name: 'bitrise',
    value: Joi.equal(
      'success',
      'error',
      'unknown'
    )
  }));

t.create('deploy status without branch')
  .get('/cde737473028420d.json?token=GCIdEzacE4GW32jLVrZb7A')
  .expectJSONTypes(Joi.object().keys({
    name: 'bitrise',
    value: Joi.equal(
      'success',
      'error',
      'unknown'
    )
  }));

t.create('unknown branch')
  .get('/cde737473028420d/unknown.json?token=GCIdEzacE4GW32jLVrZb7A')
  .expectJSON({ name: 'bitrise', value: 'unknown' });

t.create('invalid token')
  .get('/cde737473028420d/unknown.json?token=token')
  .expectJSON({ name: 'bitrise', value: 'inaccessible' });

t.create('invalid App ID')
  .get('/invalid/master.json?token=GCIdEzacE4GW32jLVrZb7A')
  .expectJSON({ name: 'bitrise', value: 'inaccessible' });

t.create('server error')
  .get('/AppID/branch.json?token=token')
  .intercept(nock => nock('https://www.bitrise.io')
    .get('/app/AppID/status.json?token=token&branch=branch')
    .reply(500, 'Something went wrong'))
  .expectJSON({ name: 'bitrise', value: 'inaccessible' });

t.create('connection error')
  .get('/AppID/branch.json?token=token')
  .networkOff()
  .expectJSON({ name: 'bitrise', value: 'inaccessible' });
