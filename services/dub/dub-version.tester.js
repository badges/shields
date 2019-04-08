'use strict'

const Joi = require('joi')
const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('version (valid)')
  .get('/vibe-d.json')
  .expectBadge({
    label: 'dub',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
    color: Joi.equal('blue', 'orange'),
  })

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'dub', message: 'not found' })
