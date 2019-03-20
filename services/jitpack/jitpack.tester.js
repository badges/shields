'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

// Github allows versions with chars, etc.
const isAnyV = Joi.string().regex(/^v.+$/)

t.create('version (github only)')
  .get('/jitpack/maven-simple.json')
  .expectBadge({ label: 'jitpack', message: isAnyV })

t.create('version (groupId)')
  .get('/com.github.erayerdin/kappdirs.json')
  .expectBadge({ label: 'jitpack', message: isAnyV })

t.create('unknown package')
  .get('/some-bogus-user/project.json')
  .expectBadge({ label: 'jitpack', message: 'project not found or private' })
