import { test, given } from 'sazerac'
import { latest, slice, rangeStart, renderVersionBadge } from './version.js'
const includePre = true

describe('Version helpers', function () {
  test(latest, () => {
    // semver-compatible versions.
    given(['1.0.0', '1.0.2', '1.0.1']).expect('1.0.2')
    given(['1.0.0', '2.0.0', '3.0.0']).expect('3.0.0')
    given(['0.0.1', '0.0.10', '0.0.2', '0.0.20']).expect('0.0.20')

    // "not-quite-valid" semver versions
    given(['1.0.00', '1.0.02', '1.0.01']).expect('1.0.02')
    given(['1.0.05', '2.0.05', '3.0.05']).expect('3.0.05')
    given(['0.0.01', '0.0.010', '0.0.02', '0.0.020']).expect('0.0.020')

    // Mixed style versions. - include pre-releases
    given(['1.0.0', 'v1.0.2', 'r1.0.1', 'release-2.0.0', 'v1.0.1-alpha.1'], {
      pre: includePre,
    }).expect('release-2.0.0')
    given(['1.0.0', 'v2.0.0', 'r1.0.1', 'release-1.0.3', 'v1.0.1-alpha.1'], {
      pre: includePre,
    }).expect('v2.0.0')
    given(['2.0.0', 'v1.0.3', 'r1.0.1', 'release-1.0.3', 'v1.0.1-alpha.1'], {
      pre: includePre,
    }).expect('2.0.0')
    given(['1.0.0', 'v1.0.2', 'r2.0.0', 'release-1.0.3', 'v1.0.1-alpha.1'], {
      pre: includePre,
    }).expect('r2.0.0')
    given(['1.0.0', 'v1.0.2', 'r2.0.0', 'release-1.0.3', 'v2.0.1-alpha.1'], {
      pre: includePre,
    }).expect('v2.0.1-alpha.1')

    // Versions with 'v' prefix.
    given(['v1.0.0', 'v1.0.2', 'v1.0.1']).expect('v1.0.2')
    given(['v1.0.0', 'v3.0.0', 'v2.0.0']).expect('v3.0.0')

    // Simple (2 number) versions.
    given(['0.1', '0.3', '0.2']).expect('0.3')
    given(['0.1', '0.5', '0.12', '0.21']).expect('0.21')
    given(['1.0', '2.0', '3.0']).expect('3.0')

    // Simple (one-number) versions
    given(['2', '10', '1']).expect('10')

    // Include pre-releases
    given(
      [
        'v1.0.1-alpha.2',
        'v1.0.1-alpha.1',
        'v1.0.1-beta.3',
        'v1.0.1-beta.1',
        'v1.0.1-RC.1',
        'v1.0.1-RC.2',
        'v1.0.0',
      ],
      { pre: includePre }
    ).expect('v1.0.1-RC.2')
    given(
      [
        'v1.0.1-alpha.2',
        'v1.0.1-alpha.1',
        'v1.0.1-beta.3',
        'v1.0.1-beta.1',
        'v1.0.1-RC.1',
        'v1.0.1-RC.2',
        'v1.0.1',
      ],
      { pre: includePre }
    ).expect('v1.0.1')
    given(
      [
        'v1.0.1-alpha.2',
        'v1.0.1-alpha.1',
        'v1.0.1-beta.3',
        'v1.0.1-beta.1',
        'v1.0.1-RC.1',
      ],
      { pre: includePre }
    ).expect('v1.0.1-RC.1')

    // Exclude pre-releases
    given([
      'v1.0.1-alpha.2',
      'v1.0.1-alpha.1',
      'v1.0.1-beta.3',
      'v1.0.1-beta.1',
      'v1.0.1-RC.1',
      'v1.0.1-RC.2',
      'v1.0.0',
    ]).expect('v1.0.0')
    given([
      'v1.0.1-alpha.2',
      'v1.0.1-alpha.1',
      'v1.0.1-beta.3',
      'v1.0.1-beta.1',
      'v1.0.1-RC.1',
      'v1.0.1-RC.2',
      'v1.0.1',
    ]).expect('v1.0.1')
    given([
      'v1.0.1-alpha.2',
      'v1.0.1-alpha.1',
      'v1.0.1-beta.3',
      'v1.0.1-beta.1',
      'v1.0.1-RC.1',
    ]).expect('v1.0.1-RC.1')

    // Versions with 'release-' prefix
    given([
      'release-1.0.0',
      'release-1.0.2',
      'release-1.0.20',
      'release-1.0.3',
    ]).expect('release-1.0.20')

    // Semver mixed with non semver versions
    given(['1.0.0', '1.0.2', '1.1', '1.0', 'notaversion2', '12bcde4']).expect(
      '1.1'
    )
  })

  test(slice, () => {
    given('2.4.7', 'major').expect('2')
    given('2.4.7', 'minor').expect('2.4')
    given('2.4.7', 'patch').expect('2.4.7')
    given('02.4.7', 'major').expect('2')
    given('2.04.7', 'minor').expect('2.4')
    given('2.4.07', 'patch').expect('2.4.7')
    given('2.4.7-alpha.1', 'major').expect('2-alpha.1')
    given('2.4.7-alpha.1', 'minor').expect('2.4-alpha.1')
    given('2.4.7-alpha.1', 'patch').expect('2.4.7-alpha.1')
  })

  test(rangeStart, () => {
    given('^2.4.7').expect('2.4.7')
  })

  test(renderVersionBadge, () => {
    given({ version: '1.2.3' }).expect({
      label: undefined,
      message: 'v1.2.3',
      color: 'blue',
    })
    given({ version: '1.2.3', tag: 'next', defaultLabel: 'npm' }).expect({
      label: 'npm@next',
      message: 'v1.2.3',
      color: 'blue',
    })
  })
})
