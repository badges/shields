'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const isTypeDefinition = Joi.string().regex(
  /^((Flow|TypeScript)|(Flow \| TypeScript))$/
)

t.create('types (from dev dependencies)')
  .get('/commander.json')
  .expectBadge({ label: 'types', message: isTypeDefinition })

t.create('types (from files)')
  .get('/form-data-entries.json')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get(`/form-data-entries/latest`)
      .reply(200, {
        maintainers: [],
        files: ['index.js', 'index.d.ts'],
      })
  )
  .expectBadge({ label: 'types', message: isTypeDefinition })

t.create('types (from types key)')
  .get('/left-pad.json')
  .expectBadge({ label: 'types', message: isTypeDefinition })

t.create('no types')
  .get('/link-into.json')
  .expectBadge({ label: 'types', message: 'none' })
