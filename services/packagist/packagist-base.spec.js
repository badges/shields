import { strict as assert } from 'assert'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import { NotFound } from '../index.js'
import BasePackagistService, {
  messageInvalidVersion,
  messageNoReleasedVersionFound,
} from './packagist-base.js'

describe('BasePackagistService', function () {
  describe('expandPackageVersions', function () {
    // @reference: https://github.com/composer/metadata-minifier/blob/c549d23829536f0d0e984aaabbf02af91f443207/tests/MetadataMinifierTest.php#L36-L40
    const minifiedSample = [
      {
        name: 'foo/bar',
        version: '2.0.0',
        version_normalized: '2.0.0.0',
        type: 'library',
        scripts: {
          foo: 'bar',
        },
        license: ['MIT'],
      },
      {
        version: '1.2.0',
        version_normalized: '1.2.0.0',
        license: ['GPL'],
        homepage: 'https://example.org',
        scripts: '__unset',
      },
      {
        version: '1.0.0',
        version_normalized: '1.0.0.0',
        homepage: '__unset',
      },
    ]

    const expandedSample = [
      {
        name: 'foo/bar',
        version: '2.0.0',
        version_normalized: '2.0.0.0',
        type: 'library',
        scripts: {
          foo: 'bar',
        },
        license: ['MIT'],
      },
      {
        name: 'foo/bar',
        version: '1.2.0',
        version_normalized: '1.2.0.0',
        type: 'library',
        license: ['GPL'],
        homepage: 'https://example.org',
      },
      {
        name: 'foo/bar',
        version: '1.0.0',
        version_normalized: '1.0.0.0',
        type: 'library',
        license: ['GPL'],
      },
    ]

    const expanded = BasePackagistService.expandPackageVersions(
      {
        packages: {
          'foobar/foobar': minifiedSample,
        },
      },
      'foobar/foobar'
    )
    it('should expand the minified package array to match the expanded sample', function () {
      assert.deepStrictEqual(
        expanded,
        expandedSample,
        'The expanded array should match the sample'
      )
    })
  })

  describe('findSpecifiedVersion', function () {
    const versions = [
      {
        name: 'foo/bar',
        version: '2.0.0',
        version_normalized: '2.0.0.0',
        type: 'library',
        scripts: {
          foo: 'bar',
        },
        license: ['GPLv3'],
      },
      {
        name: 'foo/bar',
        version: '1.2.0',
        version_normalized: '1.2.0.0',
        type: 'library',
        license: ['GPLv2'],
        homepage: 'https://example.org',
      },
      {
        name: 'foo/bar',
        version: '1.0.0',
        version_normalized: '1.0.0.0',
        type: 'library',
        license: ['GPLv1'],
      },
    ]

    it('should find the correct version metadata object', function () {
      expect(BasePackagistService.findSpecifiedVersion(versions, '1.0.0'))
        .to.have.property('license')
        .that.eql(['GPLv1'])
      expect(BasePackagistService.findSpecifiedVersion(versions, '1.2.0'))
        .to.have.property('license')
        .that.eql(['GPLv2'])
      expect(BasePackagistService.findSpecifiedVersion(versions, '2.0.0'))
        .to.have.property('license')
        .that.eql(['GPLv3'])
    })

    it(`should throw NotFound('${messageInvalidVersion}') if the specified version is not found`, function () {
      expect(() => BasePackagistService.findSpecifiedVersion(versions, '4.0.0'))
        .to.throw(NotFound)
        .with.property('prettyMessage', messageInvalidVersion)
    })
  })

  describe('findLatestVersion', function () {
    const versions = [
      {
        name: 'foo/bar',
        version: '3.0.0-alpha1',
        version_normalized: '3.0.0.0-alpha1',
        type: 'library',
        scripts: {
          foo: 'bar',
        },
        license: ['GPLv3'],
      },
      {
        name: 'foo/bar',
        version: '2.0.0',
        version_normalized: '2.0.0.0',
        type: 'library',
        scripts: {
          foo: 'bar',
        },
        license: ['GPLv3'],
      },
      {
        name: 'foo/bar',
        version: '1.2.0',
        version_normalized: '1.2.0.0',
        type: 'library',
        license: ['GPLv2'],
        homepage: 'https://example.org',
      },
      {
        name: 'foo/bar',
        version: '1.0.0',
        version_normalized: '1.0.0.0',
        type: 'library',
        license: ['GPLv1'],
      },
    ]

    it('should find the latest stable version by default', function () {
      expect(BasePackagistService.findLatestVersion(versions))
        .to.have.property('version')
        .that.equals('2.0.0')
    })

    it('should find the latest unstable version if "includePrereleases" flag is true', function () {
      expect(
        BasePackagistService.findLatestVersion(versions, {
          includePrereleases: true,
        })
      )
        .to.have.property('version')
        .that.equals('3.0.0-alpha1')
    })

    it(`should throw NotFound('${messageNoReleasedVersionFound}') if versions array is empty`, function () {
      expect(() => BasePackagistService.findLatestVersion([], true))
        .to.throw(NotFound)
        .with.property('prettyMessage', messageNoReleasedVersionFound)
    })

    it('should find the latest unstable tagged version if no stable release is found', function () {
      const versions = [
        {
          name: 'foo/bar',
          version: '3.0.0-rc1',
          version_normalized: '3.0.0.0-rc1',
          type: 'library',
          scripts: {
            foo: 'bar',
          },
          license: ['GPLv3'],
        },
        {
          name: 'foo/bar',
          version: '3.0.0-beta1',
          version_normalized: '3.0.0.0-beta1',
          type: 'library',
          scripts: {
            foo: 'bar',
          },
          license: ['GPLv3'],
        },
        {
          name: 'foo/bar',
          version: '3.0.0-alpha1',
          version_normalized: '3.0.0.0-alpha1',
          type: 'library',
          scripts: {
            foo: 'bar',
          },
          license: ['GPLv3'],
        },
      ]

      expect(BasePackagistService.findLatestVersion(versions))
        .to.have.property('version')
        .that.equals('3.0.0-rc1')
    })
  })

  describe('findSuitableBranchVersion', function () {
    it('should return the default branch if it is not named as sematic version', function () {
      const versions = [
        {
          name: 'foo/bar',
          version: 'dev-master',
          version_normalized: 'dev-master',
          'default-branch': true,
        },
        {
          name: 'foo/bar',
          version: '3.x-dev',
          version_normalized: '3.x-dev',
        },
      ]

      expect(BasePackagistService.findDefaultBranchVersion(versions))
        .to.have.property('version')
        .that.equals('dev-master')
    })

    it('should return the 3.x-dev if the default branch is 2.x-dev', function () {
      const versions = [
        {
          name: 'foo/bar',
          version: '2.x-dev',
          version_normalized: '2.x-dev',
          'default-branch': true,
        },
        {
          name: 'foo/bar',
          version: '3.x-dev',
          version_normalized: '3.x-dev',
        },
      ]

      expect(BasePackagistService.findDefaultBranchVersion(versions))
        .to.have.property('version')
        .that.equals('3.x-dev')
    })

    it(`should throw NotFound('${messageNoReleasedVersionFound}') if versions array is empty`, function () {
      expect(() => BasePackagistService.findDefaultBranchVersion([], true))
        .to.throw(NotFound)
        .with.property('prettyMessage', messageNoReleasedVersionFound)
    })
  })
})
