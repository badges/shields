import { expect } from 'chai'
import loadSimpleIcons from './load-simple-icons.js'

describe('loadSimpleIcons', function () {
  let simpleIcons
  before(function () {
    simpleIcons = loadSimpleIcons()
  })

  it('prepares three color themes', function () {
    expect(simpleIcons.sentry.base64).to.have.all.keys(
      'default',
      'light',
      'dark'
    )
  })

  it('normalizes icon keys', function () {
    // As of v5 of simple-icons the slug and exported key is `linuxfoundation`
    // with a name of `Linux Foundation`, so ensure we support both as well
    // as the legacy mapping of `linux-foundation` for backwards compatibility.
    expect(simpleIcons).to.include.key('linuxfoundation')
    expect(simpleIcons).to.include.key('linux foundation')
    expect(simpleIcons).to.include.key('linux-foundation')
  })

  // https://github.com/badges/shields/issues/4016
  it('excludes "get" function provided by the simple-icons', function () {
    expect(simpleIcons).to.not.have.property('get')
  })

  it('maps overlapping icon titles correctly', function () {
    // Both of these icons have the same title: 'Hive', so make sure
    // the proper slugs are still mapped to the correct logo
    expect(simpleIcons.hive.slug).to.equal('hive')
    expect(simpleIcons.hive.title).to.equal('Hive')
    expect(simpleIcons.hive_blockchain.slug).to.equal('hive_blockchain')
    expect(simpleIcons.hive_blockchain.title).to.equal('Hive')
  })
})
