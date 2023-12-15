import { createServiceFamily } from '../nuget/nuget-v3-service-family.js'

const { NugetVersionService: Version, NugetDownloadService: Downloads } =
  createServiceFamily({
    defaultLabel: 'baget',
    serviceBaseUrl: 'baget',
    withTenant: false,
    withFeed: false,
    withQueryNamedParams: false,
    packageDataIncludesVersion: true,
  })

class BagetVersionService extends Version {
  static examples = [
    {
      title: 'Baget',
      pattern: 'v/:packageName',
      namedParams: { packageName: 'Microsoft.AspNet.Mvc' },
      staticPreview: this.render({ version: '5.2.4' }),
    },
    {
      title: 'Baget (with prereleases)',
      pattern: 'vpre/:packageName',
      namedParams: { packageName: 'Microsoft.AspNet.Mvc' },
      staticPreview: this.render({ version: '5.2.5-preview1' }),
    },
  ]
}

class BagetDownloadService extends Downloads {
  static examples = [
    {
      title: 'Baget',
      pattern: 'dt/:packageName',
      namedParams: { packageName: 'Microsoft.AspNet.Mvc' },
      staticPreview: this.render({ downloads: 49e6 }),
    },
  ]
}

export { BagetVersionService, BagetDownloadService }
