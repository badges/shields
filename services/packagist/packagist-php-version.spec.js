import { expect } from 'chai'
import { NotFound } from '../index.js'
import PackagistPhpVersion from './packagist-php-version.service.js'

describe('PackagistPhpVersion', function () {
  const json = {
    packages: {
      'frodo/the-one-package': {
        '1.0.0': { require: { php: '^5.6 || ^7' } },
        '2.0.0': { require: { php: '^7.2' } },
        '3.0.0': { require: { php: '^7.4 || 8' } },
        'dev-main': { require: { php: '^8' }, 'default-branch': true },
      },
      'samwise/gardening': {
        '1.0.x-dev': {},
        '2.0.x-dev': {},
      },
      'pippin/mischief': {
        '1.0.0': {},
        'dev-main': { require: {}, 'default-branch': true },
      },
    },
  }

  it('should throw NotFound when package version is missing', function () {
    expect(() =>
      PackagistPhpVersion.prototype.transform({
        json,
        user: 'frodo',
        repo: 'the-one-package',
        version: '4.0.0',
      })
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'invalid version')
  })

  it('should throw NotFound when version not specified and no default branch found', function () {
    expect(() =>
      PackagistPhpVersion.prototype.transform({
        json,
        user: 'samwise',
        repo: 'gardening',
      })
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'invalid version')
  })

  it('should throw NotFound when PHP version not found on package when using default branch', function () {
    expect(() =>
      PackagistPhpVersion.prototype.transform({
        json,
        user: 'pippin',
        repo: 'mischief',
      })
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'version requirement not found')
  })

  it('should throw NotFound when PHP version not found on package when using specified version', function () {
    expect(() =>
      PackagistPhpVersion.prototype.transform({
        json,
        user: 'pippin',
        repo: 'mischief',
        version: '1.0.0',
      })
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'version requirement not found')
  })

  it('should return PHP version for the default branch', function () {
    expect(
      PackagistPhpVersion.prototype.transform({
        json,
        user: 'frodo',
        repo: 'the-one-package',
      })
    )
      .to.have.property('phpVersion')
      .that.equals('^8')
  })

  it('should return PHP version for the specified branch', function () {
    expect(
      PackagistPhpVersion.prototype.transform({
        json,
        user: 'frodo',
        repo: 'the-one-package',
        version: '3.0.0',
      })
    )
      .to.have.property('phpVersion')
      .that.equals('^7.4 || 8')
  })
})
