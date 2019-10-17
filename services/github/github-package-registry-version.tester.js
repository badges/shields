'use strict'

const Joi = require('@hapi/joi')
const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

const isPackageVersion = Joi.alternatives().try(
  isVPlusDottedVersionNClausesWithOptionalSuffix,
  Joi.string().required()
)

t.create('Package Registry version (non-existent repository)')
  .get('/v/badges/not-a-real-repo/super-fake-package.json')
  .expectBadge({
    label: 'version',
    message: 'repo not found',
  })

t.create('Package Registry version (non-existent package)')
  .get('/v/badges/shields/super-fake-package.json')
  .expectBadge({
    label: 'version',
    message: 'package not found',
  })

t.create('Package Registry version (pre-release)')
  .get('/vpre/UiPath/angular-components/angular.json')
  .expectBadge({
    label: 'version',
    message: isPackageVersion,
  })

t.create('Package Registry version (release)')
  .get('/v/github/semantic/semantic.json')
  .expectBadge({
    label: 'version',
    message: isPackageVersion,
  })
