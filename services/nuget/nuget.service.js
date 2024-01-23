import { pathParams } from '../index.js'
import { createServiceFamily } from './nuget-v3-service-family.js'

const { NugetVersionService: Version, NugetDownloadService: Downloads } =
  createServiceFamily({
    defaultLabel: 'nuget',
    serviceBaseUrl: 'nuget',
    apiBaseUrl: 'https://api.nuget.org/v3',
    withTenant: false,
    withFeed: false,
  })

class NugetVersionService extends Version {
  static openApi = {
    '/nuget/{variant}/{packageName}': {
      get: {
        summary: 'NuGet Version',
        parameters: pathParams(
          {
            name: 'variant',
            example: 'v',
            schema: { type: 'variant', enum: ['v', 'vpre'] },
            description:
              'Latest stable version (`v`) or Latest version including prereleases (`vpre`).',
          },
          { name: 'packageName', example: 'Microsoft.AspNet.Mvc' },
        ),
      },
    },
  }
}

class NugetDownloadService extends Downloads {
  static openApi = {
    '/nuget/dt/{packageName}': {
      get: {
        summary: 'NuGet Downloads',
        parameters: pathParams({
          name: 'packageName',
          example: 'Microsoft.AspNet.Mvc',
        }),
      },
    },
  }
}

export { NugetVersionService, NugetDownloadService }
