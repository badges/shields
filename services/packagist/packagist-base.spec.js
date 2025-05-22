import { expect } from 'chai'
import { describe, it } from 'mocha'
import { BasePackagistService } from './packagist-base.js'

describe('BasePackagistService', function () {
  describe('expandPackageVersions', function () {
    it('should expand the minified package array to match the expanded sample', function () {
      const minified = ['foobar/foobar']
      const expanded = BasePackagistService.expandPackageVersions(minified)
      expect(expanded).to.deep.equal(['foobar/foobar'])
    })
  })
})
