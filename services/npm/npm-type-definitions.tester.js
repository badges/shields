'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const t = ServiceTester.forThisService()
module.exports = t

const isTypeDefinition = Joi.string().regex(
  /^(Flow|TypeScript) v?[0-9]+.[0-9]+( \| (Flow|TypeScript) v?[0-9]+.[0-9]+)?$/
)

t.create('types')
  .get('/chalk.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'type definitions', value: isTypeDefinition })
  )

t.create('no types')
  .get('/left-pad.json')
  .expectJSON({ name: 'type definitions', value: 'none' })
