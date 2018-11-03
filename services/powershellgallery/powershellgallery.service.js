'use strict'

const { createServiceFamily } = require('../nuget/nuget-v2-service-family')

module.exports = createServiceFamily({
  defaultLabel: 'powershellgallery',
  serviceBaseUrl: 'powershellgallery',
  apiBaseUrl: 'https://msconfiggallery.cloudapp.net/api/v2',
})
