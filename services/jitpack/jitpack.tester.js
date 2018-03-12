'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

// Github allows versions with chars, etc.
const isAnyV = Joi.string().regex(/^v.+$/);

const t = new ServiceTester({ id: 'jitpack', title: 'JitPack' });
module.exports = t;

t.create('version')
  .get('/v/jitpack/maven-simple.json')
  .expectJSONTypes(Joi.object().keys({ name: 'JitPack', value: isAnyV }));

t.create('unknown package')
  .get('/v/some-bogus-user/project.json')
  .expectJSON({ name: 'JitPack', value: 'invalid' });

t.create('unknown info')
  .get('/z/devtools.json')
  .expectStatus(404)
  .expectJSON({ name: '404', value: 'badge not found' });

t.create('connection error')
  .get('/v/jitpack/maven-simple.json')
  .networkOff()
  .expectJSON({ name: 'JitPack', value: 'inaccessible' });
