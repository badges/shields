import { createServiceFamily } from '../nuget/nuget-v3-service-family.js'

const { NugetVersionService: Version, NugetDownloadService: Downloads } =
  createServiceFamily({
    defaultLabel: 'myget',
    serviceBaseUrl: 'myget',
    apiDomain: 'myget.org',
  })

class MyGetVersionService extends Version {
  static examples = [
    {
      title: 'MyGet',
      pattern: 'myget/:feed/v/:packageName',
      namedParams: { feed: 'mongodb', packageName: 'MongoDB.Driver.Core' },
      staticPreview: this.render({ version: '2.6.1' }),
    },
    {
      title: 'MyGet (with prereleases)',
      pattern: 'myget/:feed/vpre/:packageName',
      namedParams: { feed: 'mongodb', packageName: 'MongoDB.Driver.Core' },
      staticPreview: this.render({ version: '2.7.0-beta0001' }),
    },
    {
      title: 'MyGet tenant',
      pattern: ':tenant.myget/:feed/v/:packageName',
      namedParams: {
        tenant: 'cefsharp',
        feed: 'cefsharp',
        packageName: 'cef.sdk',
      },
      staticPreview: this.render({ version: '91.1.1' }),
    },
  ]
}

class MyGetDownloadService extends Downloads {
  static examples = [
    {
      title: 'MyGet',
      pattern: 'myget/:feed/dt/:packageName',
      namedParams: { feed: 'mongodb', packageName: 'MongoDB.Driver.Core' },
      staticPreview: this.render({ downloads: 419 }),
    },
    {
      title: 'MyGet tenant',
      pattern: ':tenant.myget/:feed/dt/:packageName',
      namedParams: {
        tenant: 'cefsharp',
        feed: 'cefsharp',
        packageName: 'CefSharp',
      },
      staticPreview: this.render({ downloads: 9748 }),
    },
  ]
}

export { MyGetVersionService, MyGetDownloadService }
