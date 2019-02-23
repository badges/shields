'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())
const { isCurrencyOverTime } = require('./liberapay-base')

t.create('Giving (valid)')
  .get('/Changaco.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'gives',
      value: isCurrencyOverTime,
    })
  )

t.create('Giving (not found)')
  .get('/does-not-exist.json')
  .expectJSON({ name: 'liberapay', value: 'not found' })

t.create('Giving (null)')
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
  .expectJSON({ name: 'liberapay', value: 'no public giving stats' })
