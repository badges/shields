import { pathParams } from '../index.js'
import { createServiceFamily } from '../nuget/nuget-v3-service-family.js'

const { NugetVersionService: Version, NugetDownloadService: Downloads } =
  createServiceFamily({
    defaultLabel: 'myget',
    serviceBaseUrl: 'myget',
    apiDomain: 'myget.org',
  })

class MyGetVersionService extends Version {
  static openApi = {
    '/myget/{feed}/{variant}/{packageName}': {
      get: {
        summary: 'MyGet Version',
        parameters: pathParams(
          { name: 'feed', example: 'mongodb' },
          {
            name: 'variant',
            example: 'v',
            schema: { type: 'variant', enum: ['v', 'vpre'] },
            description:
              'Latest stable version (`v`) or Latest version including prereleases (`vpre`).',
          },
          { name: 'packageName', example: 'MongoDB.Driver.Core' },
        ),
      },
    },
    '/{tenant}/{feed}/{variant}/{packageName}': {
      get: {
        summary: 'MyGet Version (tenant)',
        parameters: pathParams(
          {
            name: 'tenant',
            example: 'tizen.myget',
            description: 'MyGet Tenant in the format `name.myget`',
          },
          { name: 'feed', example: 'dotnet' },
          {
            name: 'variant',
            example: 'v',
            schema: { type: 'variant', enum: ['v', 'vpre'] },
            description:
              'Latest stable version (`v`) or Latest version including prereleases (`vpre`).',
          },
          { name: 'packageName', example: 'Tizen.NET' },
        ),
      },
    },
  }
}

class MyGetDownloadService extends Downloads {
  static openApi = {
    '/myget/{feed}/dt/{packageName}': {
      get: {
        summary: 'MyGet Downloads',
        parameters: pathParams(
          { name: 'feed', example: 'mongodb' },
          { name: 'packageName', example: 'MongoDB.Driver.Core' },
        ),
      },
    },
    '/{tenant}/{feed}/dt/{packageName}': {
      get: {
        summary: 'MyGet Downloads (tenant)',
        parameters: pathParams(
          {
            name: 'tenant',
            example: 'tizen.myget',
            description: 'MyGet Tenant in the format `name.myget`',
          },
          { name: 'feed', example: 'dotnet' },
          { name: 'packageName', example: 'Tizen.NET' },
        ),
      },
    },
  }
}

export { MyGetVersionService, MyGetDownloadService }
