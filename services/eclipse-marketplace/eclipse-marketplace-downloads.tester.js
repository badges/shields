'use strict'

const { ServiceTester } = require('../tester')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'EclipseMarketplaceDownloads',
  title: 'EclipseMarketplaceDownloads',
  pathPrefix: '/eclipse-marketplace',
}))

t.create('total marketplace downloads')
  .get('/dt/notepad4e.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('monthly marketplace downloads')
  .get('/dm/notepad4e.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('downloads for unknown solution')
  .get('/dt/this-does-not-exist.json')
  .expectBadge({
    label: 'downloads',
    message: 'solution not found',
  })
