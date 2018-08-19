'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const t = ServiceTester.forThisService()
module.exports = t

const isTypeDefinition = Joi.string().regex(
  /^((Flow|TypeScript)|(Flow \| TypeScript))$/
)

t.create('types (from dev dependencies + files)')
  .get('/types/chalk.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'types', value: isTypeDefinition })
  )

t.create('types (from files)')
  .get('/types/form-data-entries.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'types', value: isTypeDefinition })
  )

t.create('types (from types key)')
  .get('/types/left-pad.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'types', value: isTypeDefinition })
  )

t.create('no types')
  .get('/types/link-into.json')
  .expectJSON({ name: 'types', value: 'none' })
