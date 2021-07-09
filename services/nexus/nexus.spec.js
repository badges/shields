import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import { InvalidResponse, NotFound } from '../index.js'
import Nexus from './nexus.service.js'

describe('Nexus', function () {
  context('transform2()', function () {
    it('throws NotFound error when no versions exist', function () {
      try {
        Nexus.prototype.transform2({ json: { data: [] } })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(NotFound)
        expect(e.prettyMessage).to.equal('artifact or version not found')
      }
    })

    it('throws InvalidResponse error when no there is no latestRelease version', function () {
      try {
        Nexus.prototype.transform2({ repo: 'r', json: { data: [{}] } })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(InvalidResponse)
        expect(e.prettyMessage).to.equal('invalid artifact version')
      }
    })

    it('returns latestSnapshot value', function () {
      const latestSnapshot = '7.0.1-SNAPSHOT'
      const { version } = Nexus.prototype.transform2({
        repo: 's',
        json: {
          data: [{ latestSnapshot }, { version: '1.2.3' }],
        },
      })
      expect(version).to.equal(latestSnapshot)
    })

    it('returns version value when it is a snapshot', function () {
      const latestSnapshot = '1.2.7-SNAPSHOT'
      const { version } = Nexus.prototype.transform2({
        repo: 's',
        json: {
          data: [{ latestSnapshot: '1.2.3' }, { version: latestSnapshot }],
        },
      })
      expect(version).to.equal(latestSnapshot)
    })

    it('throws InvalidResponse error when no snapshot versions exist', function () {
      try {
        Nexus.prototype.transform2({ repo: 's', json: { data: [{}] } })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(InvalidResponse)
        expect(e.prettyMessage).to.equal('no snapshot versions found')
      }
    })

    it('throws InvalidResponse error when repository has no version data', function () {
      try {
        Nexus.prototype.transform2({
          repo: 'developer',
          json: { data: {} },
        })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(InvalidResponse)
        expect(e.prettyMessage).to.equal('invalid artifact version')
      }
    })

    context('transform3()', function () {
      it('throws NotFound error when no items exist', function () {
        try {
          Nexus.prototype.transform3({ json: { items: [] } })
          expect.fail('Expected to throw')
        } catch (e) {
          expect(e).to.be.an.instanceof(NotFound)
          expect(e.prettyMessage).to.equal('artifact or version not found')
        }
      })

      it('throws NotFound error when no snapshot items exist', function () {
        try {
          Nexus.prototype.transform3({
            repo: 's',
            json: { items: [] },
          })
          expect.fail('Expected to throw')
        } catch (e) {
          expect(e).to.be.an.instanceof(NotFound)
          expect(e.prettyMessage).to.equal(
            'artifact or snapshot version not found'
          )
        }
      })

      it('returns first item version', function () {
        const { version } = Nexus.prototype.transform3({
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
  })

  describe('auth', function () {
    cleanUpNockAfterEach()

    const user = 'admin'
    const pass = 'password'
    const config = {
      public: {
        services: {
          nexus: {
            authorizedOrigins: ['https://repository.jboss.org'],
          },
        },
      },
      private: {
        nexus_user: user,
        nexus_pass: pass,
      },
    }

    it('sends the auth information as configured', async function () {
      const scope = nock('https://repository.jboss.org')
        .get('/nexus/service/local/lucene/search')
        .query({ g: 'jboss', a: 'jboss-client' })
        // This ensures that the expected credentials are actually being sent with the HTTP request.
        // Without this the request wouldn't match and the test would fail.
        .basicAuth({ user, pass })
        .reply(200, { data: [{ latestRelease: '2.3.4' }] })

      expect(
        await Nexus.invoke(
          defaultContext,
          config,
          {
            repo: 'r',
            groupId: 'jboss',
            artifactId: 'jboss-client',
          },
          {
            server: 'https://repository.jboss.org/nexus',
          }
        )
      ).to.deep.equal({
        message: 'v2.3.4',
        color: 'blue',
      })

      scope.done()
    })
  })
})
