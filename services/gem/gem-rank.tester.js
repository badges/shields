'use strict'

const Joi = require('joi')

const isOrdinalNumber = Joi.string().regex(/^[1-9][0-9]+(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ)$/)
const isOrdinalNumberDaily = Joi.string().regex(
  /^[1-9][0-9]*(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ) daily$/
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
  .get('/rd/rails.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rank',
      value: isOrdinalNumberDaily,
    })
  )

t.create('rank (not found)')
  .get('/rt/not-a-package.json')
  .expectJSON({ name: 'rank', value: 'not found' })

t.create('rank is null')
  .get('/rd/rails.json')
  .intercept(nock =>
    nock('http://bestgems.org')
      .get('/api/v1/gems/rails/daily_ranking.json')
      .reply(200, [
        {
          date: '2019-01-06',
          daily_ranking: null,
        },
      ])
  )
  .expectJSON({ name: 'rank', value: 'invalid rank' })
