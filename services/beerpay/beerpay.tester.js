'use strict'

const Joi = require('joi')
const { withRegex } = require('../test-validators')

const t = require('../create-service-tester')()
module.exports = t

const amountOfMoney = withRegex(/^\$[0-9]+(\.[0-9]+)?/)

t.create('funding')
  .get('/hashdog/scrapfy-chrome-extension.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'beerpay',
      value: amountOfMoney,
    })
  )

t.create('funding (unknown project)')
  .get('/hashdog/not-a-real-project.json')
  .expectJSON({
    name: 'beerpay',
    value: 'project not found',
  })
