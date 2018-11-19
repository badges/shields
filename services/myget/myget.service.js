'use strict'

const { createServiceFamily } = require('../nuget/nuget-v3-service-family')

module.exports = createServiceFamily({
  defaultLabel: 'myget',
  serviceBaseUrl: 'myget',
  apiDomain: 'myget.org',
})
