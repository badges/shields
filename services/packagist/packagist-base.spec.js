import { strict as assert } from 'assert'
import { describe, it } from 'mocha'
import { BasePackagistService } from './packagist-base.js'

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

describe('BasePackagistService', () => {
  describe('expandPackageVersions', () => {
    const expanded = BasePackagistService.expandPackageVersions(
      {
        packages: {
          'foobar/foobar': minifiedSample,
        },
      },
      'foobar/foobar',
    )
    it('should expand the minified package array to match the expanded sample', () => {
      assert.deepStrictEqual(
        expanded,
        expandedSample,
        'The expanded array should match the sample',
      )
    })
  })
})
