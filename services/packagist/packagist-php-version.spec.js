import { expect } from 'chai'
import { NotFound } from '../index.js'
import { BasePackagistService } from './packagist-base.js'
import PackagistPhpVersion from './packagist-php-version.service.js'

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
  it('should throw NotFound when package version is missing', function () {
    expect(() => {
      PackagistPhpVersion.prototype.getPhpVersion({
        versions: BasePackagistService.expandPackageVersions(
          json,
          'frodo/the-one-package'
        ),
        version: '4.0.0',
      })
    })
      .to.throw(NotFound)
      .with.property('prettyMessage', 'invalid version')
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
    expect(() => {
      PackagistPhpVersion.prototype.getPhpVersion({
        versions: BasePackagistService.expandPackageVersions(
          specJson,
          'frodo/the-one-package'
        ),
      })
    })
      .to.throw(NotFound)
      .with.property('prettyMessage', 'version requirement not found')
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
            require: '__unset',
          },
        ],
      },
    }
    expect(() => {
      PackagistPhpVersion.prototype.getPhpVersion({
        versions: BasePackagistService.expandPackageVersions(
          specJson,
          'frodo/the-one-package'
        ),
        version: '1.0.0',
      })
    })
      .to.throw(NotFound)
      .with.property('prettyMessage', 'version requirement not found')
  })

  it('should return PHP version for the default release', async function () {
    expect(
      PackagistPhpVersion.prototype.getPhpVersion({
        versions: BasePackagistService.expandPackageVersions(
          json,
          'frodo/the-one-package'
        ),
      })
    )
      .to.have.property('phpVersion')
      .that.equals('^7.4 || 8')
  })

  it('should return PHP version for the specified release', async function () {
    expect(
      PackagistPhpVersion.prototype.getPhpVersion({
        versions: BasePackagistService.expandPackageVersions(
          json,
          'frodo/the-one-package'
        ),
        version: '2.0.0',
      })
    )
      .to.have.property('phpVersion')
      .that.equals('^7.2')
  })
})
