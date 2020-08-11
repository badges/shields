'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { cleanUpNockAfterEach, defaultContext } = require('../test-helpers')
const BintrayVersion = require('./bintray-version.service')

describe('BintrayVersion', function () {
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
        .get('/api/v1/packages/asciidoctor/maven/asciidoctorj/versions/_latest')
        // This ensures that the expected credentials are actually being sent with the HTTP request.
        // Without this the request wouldn't match and the test would fail.
        .basicAuth({ user, pass })
        .reply(200, {
          name: '1.5.7',
        })

      expect(
        await BintrayVersion.invoke(defaultContext, config, {
          subject: 'asciidoctor',
          repo: 'maven',
          packageName: 'asciidoctorj',
        })
      ).to.deep.equal({
        label: undefined,
        message: 'v1.5.7',
        color: 'blue',
      })

      scope.done()
    })
  })
})
