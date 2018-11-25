'use strict'

const { createServiceFamily } = require('./nuget-v3-service-family')

const {
  NugetVersionService: Version,
  NugetDownloadService: Downloads,
} = createServiceFamily({
  defaultLabel: 'nuget',
  serviceBaseUrl: 'nuget',
  apiBaseUrl: 'https://api.nuget.org/v3',
  withTenant: false,
  withFeed: false,
})

class NugetVersionService extends Version {
  static get examples() {
    return [
      {
        title: 'Nuget',
        pattern: 'v/:packageName',
        namedParams: { packageName: 'Microsoft.AspNet.Mvc' },
        staticExample: this.render({ version: '5.2.4' }),
      },
      {
        title: 'Nuget (with prereleases)',
        pattern: 'vpre/:packageName',
        namedParams: { packageName: 'Microsoft.AspNet.Mvc' },
        staticExample: this.render({ version: '5.2.5-preview1' }),
      },
    ]
  }
}

class NugetDownloadService extends Downloads {
  static get examples() {
    return [
      {
        title: 'Nuget',
        pattern: 'dt/:packageName',
        namedParams: { packageName: 'Microsoft.AspNet.Mvc' },
        staticExample: this.render({ downloads: 49e6 }),
      },
    ]
  }
}

module.exports = { NugetVersionService, NugetDownloadService }
