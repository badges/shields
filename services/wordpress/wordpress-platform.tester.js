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
  .get('/plugin/wp-version/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'wordpress',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Plugin Tested WP Version')
  .get('/plugin/tested/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'wordpress',
      value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)? tested$/),
    })
  )

t.create('Plugin Tested WP Version (Alias)')
  .get('/v/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'wordpress',
      value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)? tested$/),
    })
  )

t.create('Plugin Required WP Version | Not Found')
  .get('/plugin/wp-version/100.json')
  .expectJSON({
    name: 'wordpress',
    value: 'not found',
  })

t.create('Plugin Tested WP Version | Not Found')
  .get('/plugin/tested/100.json')
  .expectJSON({
    name: 'wordpress',
    value: 'not found',
  })

t.create('Plugin Tested WP Version (Alias) | Not Found')
  .get('/v/100.json')
  .expectJSON({
    name: 'wordpress',
    value: 'not found',
  })
