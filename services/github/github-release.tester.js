'use strict'

const Joi = require('joi')
const { isFormattedDate } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('Release')
  .get('/release/photonstorm/phaser.json')
  .expectJSONTypes(Joi.object().keys({ name: 'release', value: Joi.string() }))

t.create('Release (repo not found)')
  .get('/release/badges/helmets.json')
  .expectJSON({ name: 'release', value: 'repo not found' })

t.create('(pre-)Release')
  .get('/release-pre/photonstorm/phaser.json')
  .expectJSONTypes(Joi.object().keys({ name: 'release', value: Joi.string() }))

t.create('(pre-)Release (for legacy compatibility)')
  .get('/release/photonstorm/phaser/all.json')
  .expectJSONTypes(Joi.object().keys({ name: 'release', value: Joi.string() }))

t.create('Release Date. e.g release date|today')
  .get('/release-date/microsoft/vscode.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'release date',
      value: isFormattedDate,
    })
  )

t.create('Release Date - Custom Label. e.g myRelease|today')
  .get('/release-date/microsoft/vscode.json?label=myRelease')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'myRelease',
      value: isFormattedDate,
    })
  )

t.create(
  'Release Date - Should return `no releases or repo not found` for invalid repo'
)
  .get('/release-date/not-valid-name/not-valid-repo.json')
  .expectJSON({ name: 'release date', value: 'no releases or repo not found' })

t.create('(Pre-)Release Date. e.g release date|today')
  .get('/release-date-pre/microsoft/vscode.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'release date',
      value: isFormattedDate,
    })
  )

t.create('(Pre-)Release Date - Custom Label. e.g myRelease|today')
  .get('/release-date-pre/microsoft/vscode.json?label=myRelease')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'myRelease',
      value: isFormattedDate,
    })
  )

t.create(
  '(Pre-)Release Date - Should return `no releases or repo not found` for invalid repo'
)
  .get('/release-date-pre/not-valid-name/not-valid-repo.json')
  .expectJSON({ name: 'release date', value: 'no releases or repo not found' })
