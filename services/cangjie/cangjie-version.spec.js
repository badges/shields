import { expect } from 'chai'
import { test, given } from 'sazerac'
import sinon from 'sinon'
import { InvalidResponse } from '../index.js'
import CangjieVersion from './cangjie-version.service.js'

describe('CangjieVersion', function () {
  describe('getIndexPath', function () {
    test(CangjieVersion.getIndexPath, () => {
      given({ moduleName: 'dep' }).expect('de/p/dep')
      given({ moduleName: 'aabbcc' }).expect('aa/bb/aabbcc')
      given({ moduleName: 'f_store' }).expect('f_/st/f_store')
    })

    it('rejects undocumented short module names', function () {
      expect(() => CangjieVersion.getIndexPath({ moduleName: 'ab' })).to.throw()
    })
  })

  describe('fetch', function () {
    it('parses line-delimited index entries', async function () {
      const requestFetcher = sinon.stub().resolves({
        buffer: `
{"name":"demo","version":"1.0.0","yanked":false,"index-version":"1"}
{"name":"demo","version":"1.1.0","yanked":true,"index-version":"1"}
        `,
        res: { statusCode: 200 },
      })

      const service = new CangjieVersion(
        { requestFetcher },
        { handleInternalErrors: false },
      )

      expect(await service.fetch({ moduleName: 'demo' })).to.deep.equal([
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

    it('throws unparseable jsonl response for malformed jsonl', async function () {
      const requestFetcher = sinon.stub().resolves({
        buffer: 'not json',
        res: { statusCode: 200 },
      })

      const service = new CangjieVersion(
        { requestFetcher },
        { handleInternalErrors: false },
      )

      try {
        await service.fetch({ moduleName: 'demo' })
        expect.fail('expected fetch() to throw')
      } catch (e) {
        expect(e).to.be.instanceOf(InvalidResponse)
        expect(e.prettyMessage).to.equal('unparseable jsonl response')
      }
    })

    it('throws invalid index entry for schema-invalid lines', async function () {
      const requestFetcher = sinon.stub().resolves({
        buffer: '{"name":"demo","version":"1.0.0","index-version":"1"}',
        res: { statusCode: 200 },
      })

      const service = new CangjieVersion(
        { requestFetcher },
        { handleInternalErrors: false },
      )

      try {
        await service.fetch({ moduleName: 'demo' })
        expect.fail('expected fetch() to throw')
      } catch (e) {
        expect(e).to.be.instanceOf(InvalidResponse)
        expect(e.prettyMessage).to.equal('invalid index entry')
      }
    })
  })

  describe('getLatestVersion', function () {
    it('selects the highest non-yanked version', function () {
      const entries = [
        { version: '1.0.0', yanked: false },
        { version: '1.1.0', yanked: true },
        { version: '1.0.5', yanked: false },
      ]

      expect(CangjieVersion.getLatestVersion(entries)).to.equal('1.0.5')
    })

    it('throws when all versions are yanked', function () {
      expect(() =>
        CangjieVersion.getLatestVersion([{ version: '1.0.0', yanked: true }]),
      ).to.throw()
    })
  })
})
