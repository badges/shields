import { test, given } from 'sazerac'
import { compare, minorVersion, versionReduction } from './php-version.js'

const phpReleases = [
  '5.0',
  '5.1',
  '5.2',
  '5.3',
  '5.4',
  '5.5',
  '5.6',
  '7.0',
  '7.1',
  '7.2',
]

describe('Text PHP version', function () {
  test(minorVersion, () => {
    given('7').expect('7.0')
    given('7.1').expect('7.1')
    given('5.3.3').expect('5.3')
    given('hhvm').expect('')
  })

  test(versionReduction, () => {
    given(['5.3', '5.4', '5.5'], phpReleases).expect(['5.3 - 5.5'])
    given(['5.4', '5.5', '5.6', '7.0', '7.1'], phpReleases).expect([
      '5.4 - 7.1',
    ])
    given(['5.5', '5.6', '7.0', '7.1', '7.2'], phpReleases).expect(['>= 5.5'])
    given(['5.5', '5.6', '7.1', '7.2'], phpReleases).expect([
      '5.5',
      '5.6',
      '7.1',
      '7.2',
    ])
    given(['7.0', '7.1', '7.2'], phpReleases).expect(['>= 7'])
    given(
      ['5.0', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '7.0', '7.1', '7.2'],
      phpReleases
    ).expect(['>= 5'])
    given(['7.1', '7.2'], phpReleases).expect(['>= 7.1'])
    given(['7.1'], phpReleases).expect(['7.1'])
    given(['8.1'], phpReleases).expect([])
    given([]).expect([])
  })
})

describe('Composer version comparison', function () {
  test(compare, () => {
    // composer version scheme ordering
    given('0.9.0', '1.0.0-alpha').expect(-1)
    given('1.0.0-alpha', '1.0.0-alpha2').expect(-1)
    given('1.0.0-alpha2', '1.0.0-beta').expect(-1)
    given('1.0.0-beta', '1.0.0-beta2').expect(-1)
    given('1.0.0-beta2', '1.0.0-RC').expect(-1)
    given('1.0.0-B2', '1.0.0-RC').expect(-1)
    given('1.0.0-RC', '1.0.0-RC2').expect(-1)
    given('1.0.0-RC2', '1.0.0').expect(-1)
    given('1.0.0-rc', '1.0.0').expect(-1)
    given('1.0.0', '1.0.0-patch').expect(-1)
    given('1.0.0-patch', '1.0.0-dev').expect(-1)
    given('1.0.0-dev', '1.0.1').expect(-1)
    given('1.0.1', '1.0.x-dev').expect(-1)

    // short versions should compare equal to long versions
    given('1.0.0-p', '1.0.0-patch').expect(0)
    given('1.0.0-a', '1.0.0-alpha').expect(0)
    given('1.0.0-A', '1.0.0-alpha').expect(0)
    given('1.0.0-a2', '1.0.0-alpha2').expect(0)
    given('1.0.0-b', '1.0.0-beta').expect(0)
    given('1.0.0-b2', '1.0.0-beta2').expect(0)
    given('1.0.0-B2', '1.0.0-beta2').expect(0)

    // numeric suffixes
    given('1.0.0-b1', '1.0.0-b2').expect(-1)
    given('1.0.0-b10', '1.0.0-b11').expect(-1)
    given('1.0.0-a1', '1.0.0-a2').expect(-1)
    given('1.0.0-a10', '1.0.0-a11').expect(-1)
    given('1.0.0-RC1', '1.0.0-RC2').expect(-1)
    given('1.0.0-RC10', '1.0.0-RC11').expect(-1)
    given('1.0.0-rc10', '1.0.0-RC11').expect(-1)
  })
})
