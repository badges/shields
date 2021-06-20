import { test, given } from 'sazerac'
import { FeedzVersionService } from './feedz.service.js'

function json(versions) {
  return {
    items: versions.map(topLevel => ({
      items: topLevel.map(v => ({
        catalogEntry: {
          version: v,
        },
      })),
    })),
  }
}

function noItemsJson() {
  return {
    items: [],
  }
}

describe('Feedz service', function () {
  test(FeedzVersionService.prototype.apiUrl, () => {
    given({ organization: 'shieldstests', repository: 'public' }).expect(
      'https://f.feedz.io/shieldstests/public/nuget'
    )
  })

  test(FeedzVersionService.prototype.transform, () => {
    given({ json: json([['1.0.0']]), includePrereleases: false }).expect(
      '1.0.0'
    )
    given({
      json: json([['1.0.0', '1.0.1']]),
      includePrereleases: false,
    }).expect('1.0.1')
    given({
      json: json([['1.0.0', '1.0.1-beta1']]),
      includePrereleases: false,
    }).expect('1.0.0')
    given({
      json: json([['1.0.0', '1.0.1-beta1']]),
      includePrereleases: true,
    }).expect('1.0.1-beta1')

    given({
      json: json([['1.0.0'], ['1.0.1']]),
      includePrereleases: false,
    }).expect('1.0.1')
    given({ json: json([['1.0.1'], []]), includePrereleases: false }).expect(
      '1.0.1'
    )
    given({ json: json([[], ['1.0.1']]), includePrereleases: false }).expect(
      '1.0.1'
    )
    given({
      json: json([['1.0.0'], ['1.0.1-beta1']]),
      includePrereleases: false,
    }).expect('1.0.0')
    given({
      json: json([['1.0.0'], ['1.0.1-beta1']]),
      includePrereleases: true,
    }).expect('1.0.1-beta1')

    given({
      json: json([['1.0.0+1', '1.0.1-beta1+1']]),
      includePrereleases: false,
    }).expect('1.0.0')
    given({
      json: json([['1.0.0+1', '1.0.1-beta1+1']]),
      includePrereleases: true,
    }).expect('1.0.1-beta1')

    given({ json: json([]), includePrereleases: false }).expectError(
      'Not Found: package not found'
    )
    given({ json: json([[]]), includePrereleases: false }).expectError(
      'Not Found: package not found'
    )
    given({ json: json([[], []]), includePrereleases: false }).expectError(
      'Not Found: package not found'
    )
    given({ json: json([]), includePrereleases: true }).expectError(
      'Not Found: package not found'
    )
    given({ json: json([[]]), includePrereleases: true }).expectError(
      'Not Found: package not found'
    )
    given({ json: noItemsJson(), includePrereleases: false }).expectError(
      'Not Found: package not found'
    )
    given({ json: noItemsJson(), includePrereleases: true }).expectError(
      'Not Found: package not found'
    )
  })
})
