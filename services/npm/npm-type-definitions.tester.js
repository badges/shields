'use strict'

const Joi = require('joi')

const isTypeDefinition = Joi.string().regex(
  /^((Flow|TypeScript)|(Flow \| TypeScript))$/
)

const t = (module.exports = require('../tester').createServiceTester())

t.create('types (from dev dependencies + files)')
  .get('/chalk.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'types', value: isTypeDefinition })
  )

t.create('types (from files)')
  .get('/form-data-entries.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'types', value: isTypeDefinition })
  )

t.create('types (from types key)')
  .get('/left-pad.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'types', value: isTypeDefinition })
  )

t.create('no types')
  .get('/link-into.json')
  .expectJSON({ name: 'types', value: 'none' })
