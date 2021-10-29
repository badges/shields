import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import LibrariesIoSourcerank from './librariesio-sourcerank.service.js'
import LibrariesIoApiProvider from './librariesio-api-provider.js'

describe('LibrariesIoSourcerank', function () {
  cleanUpNockAfterEach()
  const fakeApiKey = 'fakeness'
  const response = {
    platform: 'npm',
    dependents_count: 150,
    dependent_repos_count: 191,
    rank: 100,
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
      .get(`/npm/badge-maker?api_key=${fakeApiKey}`)
      .reply(200, response)

    expect(
      await LibrariesIoSourcerank.invoke(
        {
          ...defaultContext,
          librariesIoApiProvider,
        },
        config,
        {
          platform: 'npm',
          packageName: 'badge-maker',
        }
      )
    ).to.deep.equal({
      message: 100,
      color: 'brightgreen',
    })

    scope.done()
  })
})
