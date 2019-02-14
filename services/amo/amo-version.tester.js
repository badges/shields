'use strict'

const Joi = require('joi')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Version')
  .get('/IndieGala-Helper.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'mozilla add-on',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Version (not found)')
  .get('/not-a-real-plugin.json')
  .expectJSON({ name: 'mozilla add-on', value: 'not found' })
