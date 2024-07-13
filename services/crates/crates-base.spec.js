import { expect } from 'chai'
import { test, given } from 'sazerac'
import { BaseCratesService } from './crates-base.js'

describe('BaseCratesService', function () {
  describe('getLatestVersion', function () {
    test(BaseCratesService.getLatestVersion, () => {
      given({ crate: { max_version: '1.1.0' } }).expect('1.1.0')
      given({
        crate: { max_stable_version: '1.1.0', max_version: '1.9.0-alpha' },
      }).expect('1.1.0')
    })
  })

  describe('getVersionObj', function () {
    const versions = [
      /*
      These versions are more recent, but we're going to ignore them
      That might be because they were yanked, or because they're pre-releases.
      */
      { num: '1.3.0-beta' },
      { num: '1.2.0' },
      // this is the one we will select
      { num: '1.1.0' },
    ]

    it('ignores more recent versions than max_stable_version', function () {
      const response = {
        crate: {
          max_stable_version: '1.1.0',
        },
        versions,
      }
      expect(BaseCratesService.getVersionObj(response).num).to.equal('1.1.0')
    })

    it('ignores more recent versions than max_version', function () {
      const response = {
        crate: {
          max_version: '1.1.0',
        },
        versions,
      }
      expect(BaseCratesService.getVersionObj(response).num).to.equal('1.1.0')
    })
  })
})
