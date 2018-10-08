'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = new ServiceTester({
  id: 'wordpress',
  title: 'Wordpress Platform Tests',
})
module.exports = t

t.create('Plugin Required WP Version')
  .get('/v/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'requires',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Plugin Tested WP Version')
  .get('/plugin/tested/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tested',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Plugin Required WP Version | Not Found')
  .get('/v/100.json')
  .expectJSON({
    name: 'requires',
    value: 'not found',
  })

t.create('Plugin Tested WP Version | Not Found')
  .get('/plugin/tested/100.json')
  .expectJSON({
    name: 'tested',
    value: 'not found',
  })
