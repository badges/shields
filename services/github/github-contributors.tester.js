'use strict'

const Joi = require('joi')

const t = (module.exports = require('../create-service-tester')())
const { isMetric } = require('../test-validators')

t.create('Contributors')
  .get('/contributors/cdnjs/cdnjs.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'contributors',
      value: isMetric,
    })
  )

t.create('1 contributor')
  .get('/contributors/paulmelnikow/local-credential-storage.json')
  .expectJSON({
    name: 'contributors',
    value: '1',
  })

t.create('Contributors (repo not found)')
  .get('/contributors/badges/helmets.json')
  .expectJSON({
    name: 'contributors',
    value: 'repo not found',
  })
