import { expect } from 'chai'
import { describe, it } from 'mocha'
import { BasePackagistService } from './packagist-base.js'

describe('BasePackagistService', function () {
  describe('expandPackageVersions', function () {
    it('should expand the minified package array to match the expanded sample', function () {
      const minified = {
        packages: {
          'foobar/foobar': [
            {
              version: '1.0.0',
              require: { php: '^7.4' },
            },
            {
              version: '2.0.0',
              require: '__unset',
            },
          ],
        },
      }
      const expanded = BasePackagistService.expandPackageVersions(
        minified,
        'foobar/foobar',
      )
      expect(expanded).to.deep.equal([
        {
          version: '1.0.0',
          require: { php: '^7.4' },
        },
        {
          version: '2.0.0',
        },
      ])
    })
  })
})
