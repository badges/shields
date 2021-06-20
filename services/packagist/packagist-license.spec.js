import { expect } from 'chai'
import { NotFound } from '../index.js'
import PackagistLicense from './packagist-license.service.js'

describe('PackagistLicense', function () {
  it('should throw NotFound when default branch is missing', function () {
    const json = {
      packages: {
        'frodo/the-one-package': {
          '1.0.x-dev': { license: 'MIT' },
          '1.1.x-dev': { license: 'MIT' },
          '2.0.x-dev': { license: 'MIT' },
          '2.1.x-dev': { license: 'MIT' },
        },
      },
    }
    expect(() =>
      PackagistLicense.prototype.transform({
        json,
        user: 'frodo',
        repo: 'the-one-package',
      })
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'default branch not found')
  })

  it('should return default branch when default branch is found', function () {
    const json = {
      packages: {
        'frodo/the-one-package': {
          '1.0.x-dev': { license: 'MIT' },
          '1.1.x-dev': { license: 'MIT' },
          '2.0.x-dev': {
            license: 'MIT-default-branch',
            'default-branch': true,
          },
          '2.1.x-dev': { license: 'MIT' },
        },
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
      .that.equals('MIT-default-branch')
  })
})
