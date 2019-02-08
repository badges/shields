'use strict'

const { createServiceFamily } = require('../nuget/nuget-v2-service-family')

module.exports = createServiceFamily({
  defaultLabel: 'chocolatey',
  serviceBaseUrl: 'chocolatey',
  apiBaseUrl: 'https://www.chocolatey.org/api/v2',
  odataFormat: 'json',
  title: 'Chocolatey',
  examplePackageName: 'git',
  exampleVersion: '2.19.2',
  examplePrereleaseVersion: '2.19.2',
  exampleDownloadCount: 2.2e6,
})
