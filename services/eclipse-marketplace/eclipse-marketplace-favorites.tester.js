'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const t = new ServiceTester({
  id: 'eclipse-marketplace-favorites',
  title: 'EclipseMarketplaceFavorites',
  pathPrefix: '/eclipse-marketplace',
})
module.exports = t

t.create('favorites count')
  .get('/favorites/notepad4e.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'favorites',
      value: Joi.number()
        .integer()
        .positive(),
    })
  )

t.create('favorites for unknown solution')
  .get('/favorites/this-does-not-exist.json')
  .expectJSON({
    name: 'favorites',
    value: 'solution not found',
  })
