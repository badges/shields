import { expect } from 'chai'
import { testAuth } from '../test-helpers.js'
import { NotFound } from '../index.js'
import Nexus from './nexus.service.js'

describe('Nexus', function () {
  context('transform()', function () {
    it('throws NotFound error when no items exist', function () {
      try {
        Nexus.prototype.transform({ json: { items: [] } })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(NotFound)
        expect(e.prettyMessage).to.equal('artifact or version not found')
      }
    })

    it('throws NotFound error when no snapshot items exist', function () {
      try {
        Nexus.prototype.transform({
          repo: 's',
          json: { items: [] },
        })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(NotFound)
        expect(e.prettyMessage).to.equal(
          'artifact or snapshot version not found',
        )
      }
    })

    it('returns first item version', function () {
      const { version } = Nexus.prototype.transform({
        json: {
          items: [
            { version: '1.2.3' },
            { version: '1.2.2' },
            { version: '1.0.1' },
          ],
        },
      })
      expect(version).to.equal('1.2.3')
    })
  })

  describe('auth', function () {
    const config = {
      public: {
        services: {
          nexus: {
            authorizedOrigins: ['https://repo.tomkeuper.com'],
          },
        },
      },
    }
    it('sends the auth information as configured', async function () {
      return testAuth(
        Nexus,
        'BasicAuth',
        {
          items: [
            {
              version: '9.3.95',
            },
          ],
        },
        { configOverride: config },
      )
    })
  })
})
