import { test, given } from 'sazerac'
import { createServiceFamily } from './nuget-v3-service-family.js'

const { NugetVersionService, NugetDownloadService } = createServiceFamily({
  defaultLabel: 'nuget',
  serviceBaseUrl: 'nuget',
  apiBaseUrl: 'test',
})

function versionJson(versions) {
  return {
    data: [
      {
        versions: versions.map(v => ({
          version: v,
        })),
      },
    ],
  }
}

function downloadsJson(payload) {
  return {
    data: [payload],
  }
}

const noDataJson = { data: [] }
const tooMuchDataJson = { data: [{}, {}] }

describe('Nuget Version service', function () {
  test(NugetVersionService.prototype.transform, () => {
    given({ json: versionJson(['1.0.0']), includePrereleases: false }).expect(
      '1.0.0'
    )
    given({
      json: versionJson(['1.0.0', '1.0.1']),
      includePrereleases: false,
    }).expect('1.0.1')
    given({
      json: versionJson(['1.0.0', '1.0.1-beta1']),
      includePrereleases: false,
    }).expect('1.0.0')
    given({
      json: versionJson(['1.0.0', '1.0.1-beta1']),
      includePrereleases: true,
    }).expect('1.0.1-beta1')

    given({
      json: versionJson(['1.0.0+1', '1.0.1-beta1+1']),
      includePrereleases: false,
    }).expect('1.0.0')
    given({
      json: versionJson(['1.0.0+1', '1.0.1-beta1+1']),
      includePrereleases: true,
    }).expect('1.0.1-beta1')

    given({ json: versionJson([]), includePrereleases: false }).expectError(
      'Not Found: package not found'
    )
    given({ json: versionJson([]), includePrereleases: true }).expectError(
      'Not Found: package not found'
    )
    given({ json: noDataJson, includePrereleases: false }).expectError(
      'Not Found: package not found'
    )
    given({ json: noDataJson, includePrereleases: true }).expectError(
      'Not Found: package not found'
    )
    given({ json: tooMuchDataJson, includePrereleases: false }).expectError(
      'Not Found: package not found'
    )
    given({ json: tooMuchDataJson, includePrereleases: true }).expectError(
      'Not Found: package not found'
    )
  })
})

describe('Nuget Download service', function () {
  test(NugetDownloadService.prototype.transform, () => {
    given({ json: downloadsJson({ totalDownloads: 10 }) }).expect(10)
    given({ json: downloadsJson({ totaldownloads: 11 }) }).expect(11)
    given({ json: downloadsJson({ other: 11 }) }).expect(0)
    given({ json: downloadsJson({}) }).expect(0)

    given({ json: noDataJson }).expectError('Not Found: package not found')
    given({ json: tooMuchDataJson }).expectError('Not Found: package not found')
  })
})
