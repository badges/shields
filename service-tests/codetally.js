'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id : 'codetally', title: 'Codetally' });
module.exports = t;

t.create('Codetally')
  .get('/triggerman722/colorstrap.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('codetally'),
    value: Joi.string().regex(/\b\d+(?:.\d+)?/)
  }));


t.create('Empty')
  .get('/triggerman722/colorstrap.json')
  .intercept(nock => nock('http://www.codetally.com')
    .get('/formattedshield/triggerman722/colorstrap')
    .reply(200, { currency_sign:'$', amount:'0.00', multiplier:'', currency_abbreviation:'CAD' })
  )
  .expectJSON({ name: 'codetally', value: ' $ 0.00 '});
