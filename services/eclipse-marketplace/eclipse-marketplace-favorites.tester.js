'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const t = (module.exports = new ServiceTester({
  id: 'eclipse-marketplace-favorites',
  title: 'EclipseMarketplaceFavorites',
  pathPrefix: '/eclipse-marketplace',
}))

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
