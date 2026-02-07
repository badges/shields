import { test, given } from 'sazerac'
import { FeedzVersionService } from './feedz.service.js'

describe('Feedz service', function () {
  test(FeedzVersionService.prototype.packagesUrl, () => {
    given({
      organization: 'shieldstests',
      repository: 'public',
      packageName: 'Shields.TestPackage',
    }).expect(
      'https://f.feedz.io/shieldstests/public/nuget/v3/packages/Shields.TestPackage/index.json',
    )
  })

  test(FeedzVersionService.prototype.transform, () => {
    given({
      versions: ['1.0.0'],
      includePrereleases: false,
    }).expect('1.0.0')
    given({
      versions: ['1.0.0', '1.0.1'],
      includePrereleases: false,
    }).expect('1.0.1')
    given({
      versions: ['1.0.0', '1.0.1-beta1'],
      includePrereleases: false,
    }).expect('1.0.0')
    given({
      versions: ['1.0.0', '1.0.1-beta1'],
      includePrereleases: true,
    }).expect('1.0.1-beta1')

    given({
      versions: ['1.0.0', '1.0.1'],
      includePrereleases: false,
    }).expect('1.0.1')
    given({
      versions: ['1.0.1'],
      includePrereleases: false,
    }).expect('1.0.1')
    given({
      versions: ['1.0.0', '1.0.1-beta1'],
      includePrereleases: false,
    }).expect('1.0.0')
    given({
      versions: ['1.0.0', '1.0.1-beta1'],
      includePrereleases: true,
    }).expect('1.0.1-beta1')

    given({
      versions: ['1.0.0+1', '1.0.1-beta1+1'],
      includePrereleases: false,
    }).expect('1.0.0')
    given({
      versions: ['1.0.0+1', '1.0.1-beta1+1'],
      includePrereleases: true,
    }).expect('1.0.1-beta1')

    given({ versions: [], includePrereleases: false }).expectError(
      'Not Found: package not found',
    )
    given({ versions: [], includePrereleases: true }).expectError(
      'Not Found: package not found',
    )
  })
})
