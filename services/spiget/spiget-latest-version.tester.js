'use strict'

const Joi = require('joi')
const { withRegex } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

// Note that Spigot versions can be anything (including just a string), so we'll make sure it's not returning 'not found'

t.create('EssentialsX (id 9089)')
  .get('/9089.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'version',
      value: withRegex(/^(?!not found$)/),
    })
  )

t.create('Invalid Resource (id 1)')
  .get('/1.json')
  .expectJSON({
    name: 'version',
    value: 'not found',
  })
