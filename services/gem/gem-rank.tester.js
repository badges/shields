'use strict'

const Joi = require('joi')

const isOrdinalNumber = Joi.string().regex(/^[1-9][0-9]+(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ)$/)
const isOrdinalNumberDaily = Joi.string().regex(
  /^[1-9][0-9]+(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ) daily$/
)

const t = (module.exports = require('../create-service-tester')())

t.create('total rank (valid)')
  .get('/rt/rspec-puppet-facts.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rank',
      value: isOrdinalNumber,
    })
  )

t.create('daily rank (valid)')
  .get('/rd/rspec-puppet-facts.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rank',
      value: isOrdinalNumberDaily,
    })
  )

t.create('rank (not found)')
  .get('/rt/not-a-package.json')
  .expectJSON({ name: 'rank', value: 'not found' })
