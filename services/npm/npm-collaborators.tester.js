'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('gets the contributor count')
  .get('/prettier.json')
  .expectJSONTypes(
    Joi.object({ name: 'npm collaborators', value: nonNegativeInteger })
  )

t.create('gets the contributor count from a custom registry')
  .get('/prettier.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(
    Joi.object({ name: 'npm collaborators', value: nonNegativeInteger })
  )

t.create('contributor count for unknown package')
  .get('/npm-registry-does-not-have-this-package.json')
  .expectJSON({
    name: 'npm collaborators',
    value: 'package not found',
  })
