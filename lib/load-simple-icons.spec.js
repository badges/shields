'use strict'

const { expect } = require('chai')
const loadSimpleIcons = require('./load-simple-icons')

describe('loadSimpleIcons', function() {
  let simpleIcons
  before(function() {
    simpleIcons = loadSimpleIcons()
  })

  it('prepares three color themes', function() {
    expect(simpleIcons.sentry.base64).to.have.all.keys(
      'default',
      'light',
      'dark'
    )
  })

  it('normalizes icon keys', function() {
    // original key in the simple-icons is 'Linux Foundation'
    expect(simpleIcons).to.include.key('linux-foundation')
  })

  // https://github.com/badges/shields/issues/4016
  it('excludes "get" function provided by the simple-icons', function() {
    expect(simpleIcons).to.not.have.property('get')
  })
})
