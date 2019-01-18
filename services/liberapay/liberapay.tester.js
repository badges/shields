'use strict'

const Joi = require('joi')
const { ServiceTester } = require('..')
const { isMetric } = require('../test-validators')

// Values must be greater than zero.
const isLiberapayTestValues = Joi.string().regex(
  /^([0-9]*[1-9][0-9]*(\.[0-9]+)?|[0]+\.[0-9]*[1-9][0-9]*)[ A-Za-z]{4}\/week/
)

const t = (module.exports = new ServiceTester({
  id: 'liberapay',
  title: 'Liberapay',
}))

t.create('Receiving')
  .get('/receives/Liberapay.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'receives',
      value: isLiberapayTestValues,
    })
  )

t.create('Giving')
  .get('/gives/Changaco.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'gives',
      value: isLiberapayTestValues,
    })
  )

t.create('Patrons')
  .get('/patrons/Liberapay.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'patrons',
      value: isMetric,
    })
  )

t.create('Goal Progress')
  .get('/goal/Liberapay.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'goal progress',
      value: Joi.string().regex(/^[0-9]+%/),
    })
  )

t.create('No Goal')
  .get('/goal/Liberapay.json')
  .intercept(nock =>
    nock('https://liberapay.com')
      .get('/Liberapay/public.json')
      .reply(200, { goal: null })
  )
  .expectJSON({ name: 'goal progress', value: 'anonymous' })

t.create('Empty')
  .get('/receives/Liberapay.json')
  .intercept(nock =>
    nock('https://liberapay.com')
      .get('/Liberapay/public.json')
      .reply(200, { receiving: 0.0 })
  )
  .expectJSON({ name: 'receives', value: 'anonymous' })
