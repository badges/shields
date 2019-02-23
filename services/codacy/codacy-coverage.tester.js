'use strict'

const Joi = require('joi')
const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Coverage')
  .get('/59d607d0e311408885e418004068ea58.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('Coverage on branch')
  .get('/59d607d0e311408885e418004068ea58/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('Coverage not enabled')
  .get('/e27821fb6289410b8f58338c7e0bc686.json')
  .expectJSON({
    name: 'coverage',
    value: 'not enabled for this project',
  })

t.create('Coverage (project not found)')
  .get('/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.json')
  .expectJSON({
    name: 'coverage',
    value: 'project not found',
  })
