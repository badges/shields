import { expect } from 'chai'
import { versionColorForWordpressVersion } from './wordpress-version-color.js'

describe('versionColorForWordpressVersion()', function () {
  it('generates correct colours for given versions', async function () {
    this.timeout(5e3)

    expect(await versionColorForWordpressVersion('11.2.0')).to.equal(
      'brightgreen',
    )
    expect(await versionColorForWordpressVersion('11.2')).to.equal(
      'brightgreen',
    )
    expect(await versionColorForWordpressVersion('3.2.0')).to.equal('yellow')
    expect(await versionColorForWordpressVersion('3.2')).to.equal('yellow')
    expect(await versionColorForWordpressVersion('4.7-beta.3')).to.equal(
      'yellow',
    )
    expect(await versionColorForWordpressVersion('cheese')).to.equal(
      'lightgrey',
    )
  })
})
