'use strict'

const { expect } = require('chai')
const loadSimpleIcons = require('./load-simple-icons')

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
})
