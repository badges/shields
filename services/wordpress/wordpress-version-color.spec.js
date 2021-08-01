import { expect } from 'chai'
import {
  toSemver,
  versionColorForWordpressVersion,
} from './wordpress-version-color.js'

describe('toSemver() function', function () {
  it('coerces versions', function () {
    expect(toSemver('1.1.1')).to.equal('1.1.1')
    expect(toSemver('4.2')).to.equal('4.2.0')
    expect(toSemver('1.0.0-beta')).to.equal('1.0.0-beta')
    expect(toSemver('1.0-beta')).to.equal('1.0.0-beta')
    expect(toSemver('foobar')).to.equal('foobar')
  })
})

describe('versionColorForWordpressVersion()', function () {
  it('generates correct colours for given versions', async function () {
    this.timeout(5e3)

    expect(await versionColorForWordpressVersion('11.2.0')).to.equal(
      'brightgreen'
    )
    expect(await versionColorForWordpressVersion('11.2')).to.equal(
      'brightgreen'
    )
    expect(await versionColorForWordpressVersion('3.2.0')).to.equal('yellow')
    expect(await versionColorForWordpressVersion('3.2')).to.equal('yellow')
    expect(await versionColorForWordpressVersion('4.7-beta.3')).to.equal(
      'yellow'
    )
    expect(await versionColorForWordpressVersion('cheese')).to.equal(
      'lightgrey'
    )
  })
})
