import { expect } from 'chai'
import { NotFound } from '../index.js'
import PackagistPhpVersion from './packagist-php-version.service.js'

describe('PackagistPhpVersion', function () {
  const versions = [
    {
      version: 'dev-main',
      require: { php: '^7.4 || 8' },
    },
    {
      version: 'dev-2.x',
      require: { php: '^7.2' },
    },
    {
      version: 'dev-1.x',
      require: { php: '^5.6 || ^7' },
    },
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
  ]

  it('should throw NotFound when package version is missing', function () {
    expect(() => PackagistPhpVersion.prototype.getPhpVersion(versions, '4.0.0'))
      .to.throw(NotFound)
      .with.property('prettyMessage', 'invalid version')
  })

  it('should throw NotFound when PHP version not found on package when using default release', async function () {
    expect(() =>
      PackagistPhpVersion.prototype.getPhpVersion([
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
      ])
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'version requirement not found')
  })

  it('should throw NotFound when PHP version not found on package when using specified release', async function () {
    expect(() =>
      PackagistPhpVersion.prototype.getPhpVersion(
        [
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
          },
        ],
        '1.0.0'
      )
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'version requirement not found')
  })

  it('should return PHP version for the default release', function () {
    expect(PackagistPhpVersion.prototype.getPhpVersion(versions))
      .to.have.property('phpVersion')
      .that.equals('^7.4 || 8')
  })

  it('should return PHP version for the specified release', function () {
    expect(PackagistPhpVersion.prototype.getPhpVersion(versions, '2.0.0'))
      .to.have.property('phpVersion')
      .that.equals('^7.2')
  })

  it('should throw NotFound when package version is missing', function () {
    expect(() =>
      PackagistPhpVersion.prototype.getPhpVersion([{ version: '1.0.x-dev' }])
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'version requirement not found')

    expect(() =>
      PackagistPhpVersion.prototype.getPhpVersion([
        { version: '1.0.x-dev', require: {} },
      ])
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'version requirement not found')
  })

  it('should return PHP version for the default branch', function () {
    expect(
      PackagistPhpVersion.prototype.getPhpVersion([
        { version: 'dev-1.x', require: { php: '^7.3' } },
        {
          version: 'dev-2.x',
          require: { php: '^7.4 || 8' },
          'default-branch': true,
        },
        { version: 'dev-3.x', require: { php: '^8.1' } },
      ])
    )
      .to.have.property('phpVersion')
      .that.equals('^7.4 || 8')
  })
})
