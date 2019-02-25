'use strict'

const Joi = require('joi')
const { isVPlusTripleDottedVersion } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Release')
  .get('/release/photonstorm/phaser.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'release', value: isVPlusTripleDottedVersion })
  )

t.create('Release (repo not found)')
  .get('/release/badges/helmets.json')
  .expectJSON({ name: 'release', value: 'no releases or repo not found' })

t.create('Prerelease')
  .get('/release-pre/photonstorm/phaser.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'release', value: isVPlusTripleDottedVersion })
  )

t.create('No releases')
  .get('/release/badges/daily-tests.json')
  .expectJSON({
    name: 'release',
    value: 'no releases or repo not found',
  })
