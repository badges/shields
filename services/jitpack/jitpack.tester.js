'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

// Github allows versions with chars, etc.
const isAnyV = Joi.string().regex(/^v.+$/)

t.create('version')
  .get('/jitpack/maven-simple.json')
  .expectJSONTypes(Joi.object().keys({ name: 'jitpack', value: isAnyV }))

t.create('unknown package')
  .get('/some-bogus-user/project.json')
  .expectJSON({ name: 'jitpack', value: 'project not found or private' })
