'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = new ServiceTester({
  id: 'eclipse-marketplace-version',
  title: 'EclipseMarketplaceVersion',
  pathPrefix: '/eclipse-marketplace',
})
module.exports = t

t.create('marketplace version')
  .get('/v/notepad4e.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'eclipse marketplace',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('last update for unknown solution')
  .get('/v/this-does-not-exist.json')
  .expectJSON({
    name: 'eclipse marketplace',
    value: 'solution not found',
  })
