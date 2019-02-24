'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

const isLuaVersion = Joi.string()
  .regex(/^v\d+\.\d+\.\d+-\d+$/)
  .required()

t.create('version')
  .get('/mpeterv/luacheck.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'luarocks',
      value: isLuaVersion,
    })
  )

t.create('specified version')
  .get('/mpeterv/luacheck/0.9.0-1.json')
  .expectJSON({ name: 'luarocks', value: 'v0.9.0-1' })

t.create('unknown version')
  .get('/mpeterv/luacheck/0.0.0.json')
  .expectJSON({ name: 'luarocks', value: 'version not found' })

t.create('unknown module')
  .get('/mpeterv/does-not-exist.json')
  .expectJSON({ name: 'luarocks', value: 'module not found' })

t.create('unknown user')
  .get('/nil/does-not-exist.json')
  .expectJSON({ name: 'luarocks', value: 'user not found' })
