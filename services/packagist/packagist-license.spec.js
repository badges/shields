import { expect } from 'chai'
import { NotFound } from '../index.js'
import PackagistLicense from './packagist-license.service.js'

describe('PackagistLicense', function () {
  it('should return the version of the most recent release', function () {
    const json = {
      packages: {
        'frodo/the-one-package': [
          {
            version: '1.2.4',
            license: 'MIT-latest',
          },
          {
            version: '1.2.3',
            license: 'MIT',
          },
        ],
      },
    }

    expect(
      PackagistLicense.prototype.transform({
        json,
        user: 'frodo',
        repo: 'the-one-package',
      })
    )
      .to.have.property('license')
      .that.equals('MIT-latest')
  })
})
