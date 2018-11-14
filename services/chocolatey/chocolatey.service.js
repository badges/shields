'use strict'

const { createServiceFamily } = require('../nuget/nuget-v2-service-family')

module.exports = createServiceFamily({
  defaultLabel: 'chocolatey',
  serviceBaseUrl: 'chocolatey',
  apiBaseUrl: 'https://www.chocolatey.org/api/v2',
})
