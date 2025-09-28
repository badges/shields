import { expect } from 'chai'
import loadSimpleIcons from './load-simple-icons.js'

describe('loadSimpleIcons', function () {
  let simpleIcons
  before(function () {
    simpleIcons = loadSimpleIcons()
  })

  it('prepares three color themes', function () {
    expect(simpleIcons.get('sentry').styles).to.have.all.keys(
      'default',
      'light',
      'dark',
    )
  })

  it('normalizes icon keys', function () {
    // As of v5 of simple-icons the slug and exported key is `linuxfoundation`
    // with a name of `Linux Foundation`, so ensure we support both as well
    // as the legacy mapping of `linux-foundation` for backwards compatibility.
    expect(simpleIcons.has('linuxfoundation')).to.be.true
    expect(simpleIcons.has('linux foundation')).to.be.true
    expect(simpleIcons.has('linux-foundation')).to.be.true
  })

  it('maps overlapping icon titles correctly', function () {
    // Both of these icons have the same title: 'Hive', so make sure
    // the proper slugs are still mapped to the correct logo
    expect(simpleIcons.get('hive').slug).to.equal('hive')
    expect(simpleIcons.get('hive').title).to.equal('Hive')
    expect(simpleIcons.get('hive_blockchain').slug).to.equal('hive_blockchain')
    expect(simpleIcons.get('hive_blockchain').title).to.equal('Hive')
  })
})
