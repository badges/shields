'use strict'

const Joi = require('joi')
const { colorScheme } = require('../test-helpers')
const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('version (valid)')
  .get('/vibe-d.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dub',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
      colorB: Joi.equal(colorScheme.blue, colorScheme.orange),
    })
  )

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'dub', value: 'not found' })
