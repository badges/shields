'use strict'

const { expect } = require('chai')
const { InvalidResponse } = require('..')
const PackagistVersion = require('./packagist-version.service')

describe('PackagistVersion', function() {
  it('throws InvalidResponse error when extra key is missing for vpre', function() {
    try {
      PackagistVersion.prototype.transform({
        type: 'vpre',
        json: { package: { versions: { 'dev-master': {} } } },
      })
      expect.fail('should have thrown')
    } catch (e) {
      expect(e).to.be.an.instanceof(InvalidResponse)
      expect(e.prettyMessage).to.equal('prerelease version data not available')
    }
  })
})
