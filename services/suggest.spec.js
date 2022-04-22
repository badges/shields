import { expect } from 'chai'
import nock from 'nock'
import { ExpressTestHarness } from '../core/express-test-harness.js'
import { setRoutes, githubLicense } from './suggest.js'
import GithubApiProvider from './github/github-api-provider.js'

describe('Badge suggestions', function () {
  const githubApiBaseUrl = 'https://api.github.test'
  const apiProvider = new GithubApiProvider({
    baseUrl: githubApiBaseUrl,
    globalToken: 'fake-token',
    withPooling: false,
  })

  describe('GitHub license', function () {
    context('When html_url included in response', function () {
      it('Should link to it', async function () {
        const scope = nock(githubApiBaseUrl)
          .get('/repos/atom/atom/license')
          .reply(200, {
            html_url: 'https://github.com/atom/atom/blob/master/LICENSE.md',
            license: {
              key: 'mit',
              name: 'MIT License',
              spdx_id: 'MIT',
              url: 'https://api.github.com/licenses/mit',
              node_id: 'MDc6TGljZW5zZTEz',
            },
          })

        expect(await githubLicense(apiProvider, 'atom', 'atom')).to.deep.equal({
          title: 'GitHub license',
          link: 'https://github.com/atom/atom/blob/master/LICENSE.md',
          example: {
            pattern: '/github/license/:user/:repo',
            namedParams: { user: 'atom', repo: 'atom' },
            queryParams: {},
          },
        })

        scope.done()
      })
    })

    context('When html_url not included in response', function () {
      it('Should link to the repo', async function () {
        const scope = nock(githubApiBaseUrl)
          .get('/repos/atom/atom/license')
          .reply(200, {
            license: { key: 'mit' },
          })

        expect(await githubLicense(apiProvider, 'atom', 'atom')).to.deep.equal({
          title: 'GitHub license',
          link: 'https://github.com/atom/atom',
          example: {
            pattern: '/github/license/:user/:repo',
            namedParams: { user: 'atom', repo: 'atom' },
            queryParams: {},
          },
        })

        scope.done()
      })
    })
  })

  describe('Express integration', function () {
    let harness
    beforeEach(async function () {
      harness = new ExpressTestHarness()
      await harness.start()
    })

    const origin = 'https://example.test'
    beforeEach(function () {
      setRoutes([origin], apiProvider, harness.app)
    })

    afterEach(async function () {
      await harness.stop()
    })

    context('without an origin header', function () {
      it('returns the expected suggestions', async function () {
        const scope = nock(githubApiBaseUrl)
          .get('/repos/atom/atom/license')
          .reply(200, {
            html_url: 'https://github.com/atom/atom/blob/master/LICENSE.md',
            license: {
              key: 'mit',
              name: 'MIT License',
              spdx_id: 'MIT',
              url: 'https://api.github.com/licenses/mit',
              node_id: 'MDc6TGljZW5zZTEz',
            },
          })

        const { statusCode, body } = await harness.get(
          `/$suggest/v1?url=${encodeURIComponent(
            'https://github.com/atom/atom'
          )}`,
          { responseType: 'json' }
        )
        expect(statusCode).to.equal(200)
        expect(body).to.deep.equal({
          suggestions: [
            {
              title: 'GitHub issues',
              link: 'https://github.com/atom/atom/issues',
              example: {
                pattern: '/github/issues/:user/:repo',
                namedParams: { user: 'atom', repo: 'atom' },
                queryParams: {},
              },
            },
            {
              title: 'GitHub forks',
              link: 'https://github.com/atom/atom/network',
              example: {
                pattern: '/github/forks/:user/:repo',
                namedParams: { user: 'atom', repo: 'atom' },
                queryParams: {},
              },
            },
            {
              title: 'GitHub stars',
              link: 'https://github.com/atom/atom/stargazers',
              example: {
                pattern: '/github/stars/:user/:repo',
                namedParams: { user: 'atom', repo: 'atom' },
                queryParams: {},
              },
            },
            {
              title: 'GitHub license',
              link: 'https://github.com/atom/atom/blob/master/LICENSE.md',
              example: {
                pattern: '/github/license/:user/:repo',
                namedParams: { user: 'atom', repo: 'atom' },
                queryParams: {},
              },
            },
            {
              title: 'Twitter',
              link: 'https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fatom%2Fatom',
              example: {
                pattern: '/twitter/url',
                namedParams: {},
                queryParams: {
                  url: 'https://github.com/atom/atom',
                },
              },
              preview: {
                style: 'social',
              },
            },
          ],
        })

        scope.done()
      })
    })
  })
})
