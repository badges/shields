'use strict'

const { expect } = require('chai')
const {
  toSemver,
  versionColorForWordpressVersion,
} = require('./wordpress-version-color')

describe('toSemver() function', function() {
  it('coerces versions', function() {
    expect(toSemver('1.1.1')).to.equal('1.1.1')
    expect(toSemver('4.2')).to.equal('4.2.0')
    expect(toSemver('1.0.0-beta')).to.equal('1.0.0-beta')
    expect(toSemver('1.0-beta')).to.equal('1.0.0-beta')
    expect(toSemver('foobar')).to.equal('foobar')
  })
})

describe('versionColorForWordpressVersion()', function() {
  it('generates correct colours for given versions', async function() {
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
