'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const isTypeDefinition = Joi.string().regex(
  /^((Flow|TypeScript)|(Flow \| TypeScript))$/
)

t.create('types (from dev dependencies + files)')
  .get('/chalk.json')
  .expectBadge({ label: 'types', message: isTypeDefinition })

t.create('types (from files)')
  .get('/form-data-entries.json')
  .expectBadge({ label: 'types', message: isTypeDefinition })

t.create('types (from types key)')
  .get('/left-pad.json')
  .expectBadge({ label: 'types', message: isTypeDefinition })

t.create('no types')
  .get('/link-into.json')
  .expectBadge({ label: 'types', message: 'none' })
