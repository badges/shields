import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidResponse } from '../index.js'
import PiWheelsVersion from './piwheels-version.service.js'

describe('PiWheelsVersion', function () {
  test(PiWheelsVersion.transform, () => {
    given(
      {
        '2.0.0rc1': { prerelease: true, yanked: false, files: { foobar: {} } },
        '1.9.0': { prerelease: false, yanked: false, files: { foobar: {} } },
      },
      false,
    ).expect('1.9.0')
    given(
      {
        '2.0.0rc1': { prerelease: true, yanked: false, files: { foobar: {} } },
        '1.9.0': { prerelease: false, yanked: false, files: { foobar: {} } },
      },
      true,
    ).expect('2.0.0rc1')
    given(
      {
        '2.0.0': { prerelease: false, yanked: true, files: { foobar: {} } },
        '1.9.0': { prerelease: false, yanked: false, files: { foobar: {} } },
      },
      false,
    ).expect('1.9.0')
    given(
      {
        '2.0.0': { prerelease: false, yanked: false, files: {} },
        '1.9.0': { prerelease: false, yanked: false, files: { foobar: {} } },
      },
      false,
    ).expect('1.9.0')
    given(
      {
        '2.0.0': { prerelease: false, yanked: false, files: { foobar: {} } },
        '1.9.0': { prerelease: false, yanked: false, files: { foobar: {} } },
      },
      false,
    ).expect('2.0.0')
    given(
      {
        '2.0.0rc2': { prerelease: true, yanked: false, files: { foobar: {} } },
        '2.0.0rc1': { prerelease: true, yanked: false, files: { foobar: {} } },
      },
      false,
    ).expect('2.0.0rc2')
  })

  it('throws `no releases` InvalidResponse if no versions', function () {
    expect(() =>
      PiWheelsVersion.transform(
        {
          '1.0.1': { prerelease: false, yanked: false, files: {} },
          '1.0.0': { prerelease: false, yanked: true, files: { foobar: {} } },
        },
        false,
      ),
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'no versions found')
  })
})
