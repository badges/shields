'use strict'

const Joi = require('joi')

const t = require('../create-service-tester')()
module.exports = t

const isGrade = Joi.equal('A', 'B', 'C', 'D', 'E', 'F')

t.create('Code qualiy')
  .get('/grade/e27821fb6289410b8f58338c7e0bc686.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'code quality',
      value: isGrade,
    })
  )

t.create('Code qualiy on branch')
  .get('/grade/e27821fb6289410b8f58338c7e0bc686/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'code quality',
      value: isGrade,
    })
  )
