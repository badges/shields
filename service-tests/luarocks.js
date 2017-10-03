'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'luarocks', title: 'LuaRocks' });
module.exports = t;

const isLuaVersion = Joi.string().regex(/^v\d+\.\d+\.\d+-\d+$/);

t.create('version')
  .get('/v/mpeterv/luacheck.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'luarocks',
    value: isLuaVersion
  }));

t.create('unknown package')
  .get('/v/nil/does-not-exist.json')
  .expectJSON({ name: 'luarocks', value: 'invalid' });

t.create('connection error')
  .get('/v/mpeterv/luacheck.json')
  .networkOff()
  .expectJSON({ name: 'luarocks', value: 'inaccessible' });
