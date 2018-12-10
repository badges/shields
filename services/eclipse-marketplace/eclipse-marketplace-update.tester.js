'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isFormattedDate } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'eclipse-marketplace-update',
  title: 'EclipseMarketplaceUpdate',
  pathPrefix: '/eclipse-marketplace',
}))

t.create('last update date')
  .get('/last-update/notepad4e.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'updated',
      value: isFormattedDate,
    })
  )

t.create('last update for unknown solution')
  .get('/last-update/this-does-not-exist.json')
  .expectJSON({
    name: 'updated',
    value: 'solution not found',
  })
