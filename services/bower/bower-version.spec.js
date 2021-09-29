import { expect } from 'chai'
import { test, given } from 'sazerac'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import { InvalidResponse } from '../index.js'
import LibrariesIoApiProvider from '../librariesio/librariesio-api-provider.js'
import { BowerVersion } from './bower-version.service.js'

describe('BowerVersion', function () {
  test(BowerVersion.transform, () => {
    given(
      {
        latest_release_number: '2.0.0-beta',
        latest_stable_release_number: '1.8.3',
      },
      false
    ).expect('1.8.3')
    given(
      {
        latest_release_number: '2.0.0-beta',
        latest_stable_release_number: '1.8.3',
      },
      true
    ).expect('2.0.0-beta')
  })

  it('throws `no releases` InvalidResponse if no stable version', function () {
    expect(() =>
      BowerVersion.transform({ latest_release_number: 'panda' }, false)
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'no releases')
  })

  it('throws `no releases` InvalidResponse if no prereleases', function () {
    expect(() =>
      BowerVersion.transform({ latest_stable_release_number: 'penguin' }, true)
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'no releases')
  })

  context('auth', function () {
    cleanUpNockAfterEach()
    const fakeApiKey = 'fakeness'
    const response = {
      normalized_licenses: [],
      latest_release_number: '2.0.0-beta',
      latest_stable_release_number: '1.8.3',
    }
    const config = {
      private: {
        librariesio_tokens: fakeApiKey,
      },
    }
    const librariesIoApiProvider = new LibrariesIoApiProvider({
      baseUrl: 'https://libraries.io/api',
      tokens: [fakeApiKey],
    })

    it('sends the auth information as configured', async function () {
      const scope = nock('https://libraries.io/api')
        // This ensures that the expected credentials are actually being sent with the HTTP request.
        // Without this the request wouldn't match and the test would fail.
        .get(`/bower/bootstrap?api_key=${fakeApiKey}`)
        .reply(200, response)

      expect(
        await BowerVersion.invoke(
          {
            ...defaultContext,
            librariesIoApiProvider,
          },
          config,
          {
            platform: 'bower',
            packageName: 'bootstrap',
          },
          {
            include_prereleases: '',
          }
        )
      ).to.deep.equal({
        message: 'v2.0.0-beta',
        color: 'orange',
        label: undefined,
      })

      scope.done()
    })
  })
})
