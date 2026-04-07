import { expect } from 'chai'
import { test, given } from 'sazerac'
import { BaseCangjieService } from './cangjie-base.js'

describe('BaseCangjieService', function () {
  describe('getIndexPath', function () {
    test(BaseCangjieService.getIndexPath, () => {
      given({ moduleName: 'dep' }).expect('de/p/dep')
      given({ moduleName: 'aabbcc' }).expect('aa/bb/aabbcc')
      given({ moduleName: 'f_store' }).expect('f_/st/f_store')
    })

    it('rejects undocumented short module names', function () {
      expect(() =>
        BaseCangjieService.getIndexPath({ moduleName: 'ab' }),
      ).to.throw()
    })
  })

  describe('parseIndexEntries', function () {
    it('parses line-delimited index entries', function () {
      const entries = BaseCangjieService.parseIndexEntries(`
{"name":"demo","version":"1.0.0","yanked":false,"index-version":"1"}
{"name":"demo","version":"1.1.0","yanked":true,"index-version":"1"}
      `)

      expect(entries).to.deep.equal([
        {
          name: 'demo',
          version: '1.0.0',
          yanked: false,
          'index-version': '1',
        },
        {
          name: 'demo',
          version: '1.1.0',
          yanked: true,
          'index-version': '1',
        },
      ])
    })
  })

  describe('getLatestVersion', function () {
    it('selects the highest non-yanked version', function () {
      const entries = [
        { version: '1.0.0', yanked: false },
        { version: '1.1.0', yanked: true },
        { version: '1.0.5', yanked: false },
      ]

      expect(BaseCangjieService.getLatestVersion(entries)).to.equal('1.0.5')
    })

    it('throws when all versions are yanked', function () {
      expect(() =>
        BaseCangjieService.getLatestVersion([
          { version: '1.0.0', yanked: true },
        ]),
      ).to.throw()
    })
  })
})
