'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'chrome-web-store/price',
  title: 'Chrome Web Store Price',
}))

t.create('Price')
  .get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'price',
      value: Joi.string().regex(/^\$\d+(.\d{1,2})?$/),
    })
  )

t.create('Price (not found)')
  .get('/invalid-name-of-addon.json')
  .expectJSON({ name: 'price', value: 'not found' })
