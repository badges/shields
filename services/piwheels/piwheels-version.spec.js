import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidResponse } from '../index.js'
import PiWheelsVersion from './piwheels-version.service.js'

describe('PiWheelsVersion', function () {
  test(PiWheelsVersion.transform, () => {
    given(
      {
        '2.0.0rc1': { prerelease: true, yanked: false },
        '1.9.0': { prerelease: false, yanked: false },
      },
      false
    ).expect('1.9.0')
    given(
      {
        '2.0.0rc1': { prerelease: true, yanked: false },
        '1.9.0': { prerelease: false, yanked: false },
      },
      true
    ).expect('2.0.0rc1')
    given(
      {
        '2.0.0': { prerelease: false, yanked: true },
        '1.9.0': { prerelease: false, yanked: false },
      },
      false
    ).expect('1.9.0')
    given(
      {
        '2.0.0': { prerelease: false, yanked: false },
        '1.9.0': { prerelease: false, yanked: false },
      },
      false
    ).expect('2.0.0')
    given(
      {
        '2.0.0rc2': { prerelease: true, yanked: false },
        '2.0.0rc1': { prerelease: true, yanked: false },
      },
      false
    ).expect('2.0.0rc2')
  })

  it('throws `no releases` InvalidResponse if no versions', function () {
    expect(() =>
      PiWheelsVersion.transform(
        { '1.0.0': { prerelease: false, yanked: true } },
        false
      )
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'no versions found')
  })
})
