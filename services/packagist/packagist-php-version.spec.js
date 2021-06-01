'use strict'

const { expect } = require('chai')
const PackagistPhpVersion = require('./packagist-php-version.service')

describe('PackagistPhpVersion', function () {
  const json = {
    packages: {
      'frodo/the-one-package': [
        {
          version: '3.0.0',
          require: { php: '^7.4 || 8' },
        },
        {
          version: '2.0.0',
          require: { php: '^7.2' },
        },
        {
          version: '1.0.0',
          require: { php: '^5.6 || ^7' },
        },
      ],
    },
  }

  it('should throw NotFound when package version is missing', async function () {
    await expect(
      PackagistPhpVersion.prototype.transform({
        json,
        user: 'frodo',
        repo: 'the-one-package',
        version: '4.0.0',
      })
    ).to.be.rejectedWith('invalid version')
  })

  it('should throw NotFound when PHP version not found on package when using default release', async function () {
    const specJson = {
      packages: {
        'frodo/the-one-package': [
          {
            version: '3.0.0',
          },
          {
            version: '2.0.0',
            require: { php: '^7.2' },
          },
          {
            version: '1.0.0',
            require: { php: '^5.6 || ^7' },
          },
        ],
      },
    }
    await expect(
      PackagistPhpVersion.prototype.transform({
        json: specJson,
        user: 'frodo',
        repo: 'the-one-package',
      })
    ).to.be.rejectedWith('version requirement not found')
  })

  it('should throw NotFound when PHP version not found on package when using specified release', async function () {
    const specJson = {
      packages: {
        'frodo/the-one-package': [
          {
            version: '3.0.0',
            require: { php: '^7.4 || 8' },
          },
          {
            version: '2.0.0',
            require: { php: '^7.2' },
          },
          {
            version: '1.0.0',
            require: { php: '__unset' },
          },
        ],
      },
    }
    await expect(
      PackagistPhpVersion.prototype.transform({
        json: specJson,
        user: 'frodo',
        repo: 'the-one-package',
        version: '1.0.0',
      })
    ).to.be.rejectedWith('version requirement not found')
  })

  it('should return PHP version for the default release', async function () {
    expect(
      await PackagistPhpVersion.prototype.transform({
        json,
        user: 'frodo',
        repo: 'the-one-package',
      })
    )
      .to.have.property('phpVersion')
      .that.equals('^7.4 || 8')
  })

  it('should return PHP version for the specified release', async function () {
    expect(
      await PackagistPhpVersion.prototype.transform({
        json,
        user: 'frodo',
        repo: 'the-one-package',
        version: '2.0.0',
      })
    )
      .to.have.property('phpVersion')
      .that.equals('^7.2')
  })
})
