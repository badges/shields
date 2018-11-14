'use strict'

const { createServiceFamily } = require('../nuget/nuget-v2-service-family')

module.exports = createServiceFamily({
  defaultLabel: 'resharper',
  serviceBaseUrl: 'resharper',
  apiBaseUrl: 'https://resharper-plugins.jetbrains.com/api/v2',
})
