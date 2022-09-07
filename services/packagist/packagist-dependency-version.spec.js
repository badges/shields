import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import PackagistDependencyVersion from './packagist-dependency-version.service.js'
const { expect } = chai
chai.use(chaiAsPromised)

describe('PackagistDependencyVersion', function () {
  const fullPackagistJson = {
    packages: {
      'frodo/the-one-package': [
        {
          version: '3.0.0',
          require: { php: '^7.4 || 8', 'twig/twig': '~1.28|~2.0' },
        },
        {
          version: '2.0.0',
          require: { php: '^7.2', 'twig/twig': '~1.20|~1.30' },
        },
        {
          version: '1.0.0',
          require: { php: '^5.6 || ^7', 'twig/twig': '~1.10|~1.0' },
        },
      ],
    },
  }

  it('should throw NotFound when package version is missing', async function () {
    await expect(
      PackagistDependencyVersion.prototype.getDependencyVersion({
        json: fullPackagistJson,
        user: 'frodo',
        repo: 'the-one-package',
        version: '4.0.0',
      })
    ).to.be.rejectedWith('invalid version')
  })

  it('should throw NotFound when dependency version not found on package when using default release', async function () {
    await expect(
      PackagistDependencyVersion.prototype.getDependencyVersion({
        json: fullPackagistJson,
        user: 'frodo',
        repo: 'the-one-package',
      })
    ).to.be.rejectedWith('dependency vendor or repo not specified')
  })

  it('should throw NotFound when dependency version not found on package when using specified release', async function () {
    const fullPackagistJson = {
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
    await expect(
      PackagistDependencyVersion.prototype.getDependencyVersion({
        json: fullPackagistJson,
        user: 'frodo',
        repo: 'the-one-package',
        version: '1.0.0',
      })
    ).to.be.rejectedWith('version requirement not found')
  })

  it('should throw NotFound if dependency was not specified', async function () {
    await expect(
      PackagistDependencyVersion.prototype.getDependencyVersion({
        json: fullPackagistJson,
        user: 'frodo',
        repo: 'the-one-package',
      })
    ).to.be.rejectedWith('dependency vendor or repo not specified')
  })

  it('should return dependency version for the default release', async function () {
    expect(
      await PackagistDependencyVersion.prototype.getDependencyVersion({
        json: fullPackagistJson,
        user: 'frodo',
        repo: 'the-one-package',
        dependency: 'twig/twig',
      })
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
        version: '2.0.0',
        dependency: 'twig/twig',
      })
    )
      .to.have.property('dependencyVersion')
      .that.equals('~1.20|~1.30')
  })
})
