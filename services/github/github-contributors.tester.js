'use strict'

const Joi = require('joi')

const t = (module.exports = require('../create-service-tester')())

t.create('Contributors')
  .get('/cdnjs/cdnjs.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'contributors',
      value: Joi.string().regex(/^\w+$/),
    })
  )

t.create('Contributors (repo not found)')
  .get('/badges/helmets.json')
  .expectJSON({
    name: 'contributors',
    value: 'repo not found',
  })
