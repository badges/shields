'use strict'

const { expect } = require('chai')
const { NotFound } = require('..')
const PackagistLicense = require('./packagist-license.service')

describe('PackagistLicense', function() {
  it('should throw NotFound when default branch is missing', function() {
    const json = {
      packages: {
        'doctrine/orm': {},
        'elhadraoui/doctrine-orm': {
          'dev-master': { license: 'MIT' },
        },
      },
    }
    expect(() =>
      PackagistLicense.prototype.transform({
        json,
        user: 'doctrine',
        repo: 'orm',
      })
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'default branch not found')
  })
})
