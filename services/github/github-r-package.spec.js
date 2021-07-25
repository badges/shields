import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidResponse } from '../index.js'
import GithubRPackageVersion from './github-r-package.service.js'

describe('GithubRPackageVersion', function () {
  const content = versionLine =>
    [
      'Package: mypackage',
      'Title: What The Package Does (one line, title case required)',
      versionLine,
      '',
    ].join('\n')

  test(GithubRPackageVersion.transform, () => {
    given(content('Version: 6.10.9'), 'DESCRIPTION').expect({
      version: '6.10.9',
    })
  })

  it('throws InvalidResponse if a file does not contain version specification', function () {
    expect(() =>
      GithubRPackageVersion.transform(content('Versio: 6.10.9'), 'DESCRIPTION')
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'Version missing in DESCRIPTION')
  })
})
