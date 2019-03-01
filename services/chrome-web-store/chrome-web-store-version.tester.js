'use strict'

const Joi = require('joi')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'chrome-web-store/v',
  title: 'Chrome Web Store Version',
}))

t.create('Version')
  .get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'chrome web store',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Version (not found)')
  .get('/invalid-name-of-addon.json')
  .expectJSON({ name: 'chrome web store', value: 'not found' })
