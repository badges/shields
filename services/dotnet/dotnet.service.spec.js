import { test, given } from 'sazerac'
import {
  normalizeTargetFramework,
  extractTargetFrameworks,
  REGISTRATION_BASE_URL,
} from './dotnet-helpers.js'
import Dotnet from './dotnet.service.js'

describe('.NET service', function () {
  test(normalizeTargetFramework, () => {
    given(null).expect('all')
    given(undefined).expect('all')
    given('').expect('all')
    given('net8.0').expect('net8.0')
    given('.NETFramework4.8').expect('net48')
    given('.NETFramework4.5').expect('net45')
    given('.NETStandard2.0').expect('netstandard2.0')
    given('.NETCoreApp3.1').expect('netcoreapp3.1')
  })

  test(extractTargetFrameworks, () => {
    given([
      { targetFramework: '.NETStandard2.0' },
      { targetFramework: '.NETFramework4.8' },
      { targetFramework: 'net8.0' },
    ]).expect(['net48', 'net8.0', 'netstandard2.0'])
    given([{ targetFramework: null }]).expect(['all'])
    given([
      { targetFramework: 'net6.0' },
      { targetFramework: 'net6.0' },
    ]).expect(['net6.0'])
  })

  test(Dotnet.prototype.registrationIndexUrl, () => {
    given({ packageName: 'Humanizer.Core' }).expect(
      `${REGISTRATION_BASE_URL}humanizer.core/index.json`,
    )
  })

  test(Dotnet.prototype.transform, () => {
    given({
      catalogEntries: [
        {
          catalogEntry: {
            version: '1.0.0',
            dependencyGroups: [{ targetFramework: 'net6.0' }],
          },
        },
      ],
      includePrereleases: false,
    }).expect(['net6.0'])

    given({
      catalogEntries: [
        {
          catalogEntry: {
            version: '1.0.0',
            dependencyGroups: [{ targetFramework: 'net6.0' }],
          },
        },
        {
          catalogEntry: {
            version: '2.0.0-beta1',
            dependencyGroups: [{ targetFramework: 'net8.0' }],
          },
        },
      ],
      includePrereleases: false,
    }).expect(['net6.0'])

    given({
      catalogEntries: [
        {
          catalogEntry: {
            version: '1.0.0',
            dependencyGroups: [{ targetFramework: 'net6.0' }],
          },
        },
        {
          catalogEntry: {
            version: '2.0.0-beta1',
            dependencyGroups: [{ targetFramework: 'net8.0' }],
          },
        },
      ],
      includePrereleases: true,
    }).expect(['net8.0'])

    given({
      catalogEntries: [],
      includePrereleases: false,
    }).expectError('Not Found: package not found')

    given({
      catalogEntries: [
        {
          catalogEntry: {
            version: '1.0.0',
            dependencyGroups: [],
          },
        },
      ],
      includePrereleases: false,
    }).expectError('Invalid Response')
  })
})
