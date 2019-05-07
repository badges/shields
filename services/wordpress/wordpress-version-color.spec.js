'use strict'

const { expect } = require('chai')
const { versionColorForWordpressVersion } = require('./wordpress-version-color')

describe('WordPress version color helpers', function() {
  it('versionColorForWordpressVersion()', async function() {
    expect(await versionColorForWordpressVersion('11.2.0')).to.equal(
      'brightgreen'
    )
    expect(await versionColorForWordpressVersion('11.2')).to.equal(
      'brightgreen'
    )
    expect(await versionColorForWordpressVersion('3.2.0')).to.equal('yellow')
    expect(await versionColorForWordpressVersion('3.2')).to.equal('yellow')
  })
})
