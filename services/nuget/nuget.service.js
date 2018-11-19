'use strict'

const { createServiceFamily } = require('./nuget-v3-service-family')

module.exports = createServiceFamily({
  defaultLabel: 'nuget',
  serviceBaseUrl: 'nuget',
  apiBaseUrl: 'https://api.nuget.org/v3',
  withTenant: false,
  withFeed: false,
})
