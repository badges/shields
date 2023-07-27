import { expect } from 'chai'
import { NotFound } from '../index.js'
import PackagistLicense from './packagist-license.service.js'

describe('PackagistLicense', function () {
  it('should return the license of the most recent release', function () {
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
      }),
    )
      .to.have.property('license')
      .that.equals('MIT-latest')
  })

  it('should return the license of the most recent stable release', function () {
    const json = {
      packages: {
        'frodo/the-one-package': [
          {
            version: '1.2.4-RC1', // Pre-release
            license: 'MIT-latest',
          },
          {
            version: '1.2.3', // Stable release
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
      }),
    )
      .to.have.property('license')
      .that.equals('MIT')
  })

  it('should return the license of the most recent pre-release if no stable releases', function () {
    const json = {
      packages: {
        'frodo/the-one-package': [
          {
            version: '1.2.4-RC2',
            license: 'MIT-latest',
          },
          {
            version: '1.2.4-RC1',
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
      }),
    )
      .to.have.property('license')
      .that.equals('MIT-latest')
  })

  it('should throw NotFound when license key not in response', function () {
    const json = {
      packages: {
        'frodo/the-one-package': [
          {
            version: '1.2.4',
          },
          {
            version: '1.2.3',
          },
        ],
      },
    }

    expect(() =>
      PackagistLicense.prototype.transform({
        json,
        user: 'frodo',
        repo: 'the-one-package',
      }),
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'license not found')
  })
})
