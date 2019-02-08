'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'EclipseMarketplaceDownloads',
  title: 'EclipseMarketplaceDownloads',
  pathPrefix: '/eclipse-marketplace',
}))

t.create('total marketplace downloads')
  .get('/dt/notepad4e.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('monthly marketplace downloads')
  .get('/dm/notepad4e.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('downloads for unknown solution')
  .get('/dt/this-does-not-exist.json')
  .expectJSON({
    name: 'downloads',
    value: 'solution not found',
  })
