'use strict'

const Joi = require('joi')
const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Goal Progress (valid)')
  .get('/Liberapay.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'goal progress',
      value: isIntegerPercentage,
    })
  )

t.create('Goal Progress (not found)')
  .get('/does-not-exist.json')
  .expectJSON({ name: 'liberapay', value: 'not found' })

t.create('Goal Progress (no goal set)')
  .get('/Liberapay.json')
  .intercept(nock =>
    nock('https://liberapay.com')
      .get('/Liberapay/public.json')
      .reply(200, {
        npatrons: 0,
        giving: null,
        receiving: null,
        goal: null,
      })
  )
  .expectJSON({ name: 'liberapay', value: 'no public goals' })
