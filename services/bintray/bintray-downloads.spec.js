'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { cleanUpNockAfterEach, defaultContext } = require('../test-helpers')
const BintrayDownloads = require('./bintray-downloads.service')

describe('BintrayDownloads', function () {
  describe('auth', function () {
    cleanUpNockAfterEach()

    const user = 'admin'
    const pass = 'password'
    const config = {
      private: {
        bintray_user: user,
        bintray_apikey: pass,
      },
    }

    it('sends the auth information as configured', async function () {
      const scope = nock('https://bintray.com')
        .get('/api/ui/package/asciidoctor/maven/asciidoctorj/total_downloads')
        // This ensures that the expected credentials are actually being sent with the HTTP request.
        // Without this the request wouldn't match and the test would fail.
        .basicAuth({ user, pass })
        .reply(200, {
          totalDownloads: 69,
        })

      expect(
        await BintrayDownloads.invoke(defaultContext, config, {
          interval: 'dt',
          subject: 'asciidoctor',
          repo: 'maven',
          packageName: 'asciidoctorj',
        })
      ).to.deep.equal({
        color: 'yellowgreen',
        label: 'downloads',
        message: '69',
      })

      scope.done()
    })
  })
})
