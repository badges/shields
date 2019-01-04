'use strict'

const Joi = require('joi')

const t = (module.exports = require('../create-service-tester')())

t.create('Commits since')
  .get('/badges/shields/a0663d8da53fb712472c02665e6ff7547ba945b7.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
      value: Joi.string().regex(/^\w+$/),
    })
  )

t.create('Commits since by latest release')
  .get('/microsoft/typescript/latest.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
      value: Joi.string().regex(/^\d+\w?$/),
    })
  )
