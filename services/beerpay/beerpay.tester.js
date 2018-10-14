'use strict'

const Joi = require('joi')

const createServiceTester = require('../create-service-tester')
const { withRegex } = require('../test-validators')
const { colorScheme } = require('../test-helpers')

const t = createServiceTester()

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

t.create('funding 0')
  .get('/hashdog/scrapfy-chrome-extension.json?style=_shields_test')
  .intercept(nock =>
    nock('https://beerpay.io')
      .get('/api/v1/hashdog/projects/scrapfy-chrome-extension')
      .reply(200, {})
  )
  .expectJSON({
    name: 'beerpay',
    value: '$0',
    colorB: colorScheme.red,
  })
