'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const t = createServiceTester()
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
