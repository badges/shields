'use strict'

const Joi = require('joi')
const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('version (valid)')
  .get('/vibe-d.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dub',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
      color: Joi.equal('blue', 'orange'),
    })
  )

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'dub', value: 'not found' })
