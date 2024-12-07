import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import PackagistDependencyVersion from './packagist-dependency-version.service.js'
use(chaiAsPromised)

describe('PackagistDependencyVersion', function () {
  const fullPackagistJson = {
    packages: {
      'frodo/the-one-package': [
        {
          version: 'v3.0.0',
          require: { php: '^7.4 || 8', 'twig/twig': '~1.28|~2.0' },
        },
        {
          version: 'v2.5.0',
          require: '__unset',
        },
        {
          version: 'v2.4.0',
        },
        {
          version: 'v2.0.0',
          require: { php: '^7.2', 'twig/twig': '~1.20|~1.30' },
        },
        {
          version: 'v1.0.0',
          require: { php: '^5.6 || ^7', 'twig/twig': '~1.10|~1.0' },
        },
      ],
    },
  }

  it('should throw NotFound when package version is missing in the response', async function () {
    await expect(
      PackagistDependencyVersion.prototype.getDependencyVersion({
        json: fullPackagistJson,
        user: 'frodo',
        repo: 'the-one-package',
        version: 'v4.0.0',
      }),
    ).to.be.rejectedWith('invalid version')
  })

  it('should throw NotFound when `require` section is missing in the response', async function () {
    await expect(
      PackagistDependencyVersion.prototype.getDependencyVersion({
        json: fullPackagistJson,
        user: 'frodo',
        repo: 'the-one-package',
        version: 'v2.4.0',
      }),
    ).to.be.rejectedWith('version requirement not found')
  })

  it('should throw NotFound when `require` section in the response has the value of __unset (thank you, Packagist API :p)', async function () {
    await expect(
      PackagistDependencyVersion.prototype.getDependencyVersion({
        json: fullPackagistJson,
        user: 'frodo',
        repo: 'the-one-package',
        version: 'v2.5.0',
      }),
    ).to.be.rejectedWith('version requirement not found')
  })

  it('should return dependency version for the default release', async function () {
    expect(
      await PackagistDependencyVersion.prototype.getDependencyVersion({
        json: fullPackagistJson,
        user: 'frodo',
        repo: 'the-one-package',
        dependency: 'twig/twig',
      }),
    )
      .to.have.property('dependencyVersion')
      .that.equals('~1.28|~2.0')
  })

  it('should return dependency version for the specified release', async function () {
    expect(
      await PackagistDependencyVersion.prototype.getDependencyVersion({
        json: fullPackagistJson,
        user: 'frodo',
        repo: 'the-one-package',
        version: 'v2.0.0',
        dependency: 'twig/twig',
      }),
    )
      .to.have.property('dependencyVersion')
      .that.equals('~1.20|~1.30')
  })
})
