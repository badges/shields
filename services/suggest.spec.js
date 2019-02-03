'use strict'

const Camp = require('camp')
const { expect } = require('chai')
const got = require('got')
const nock = require('nock')
const portfinder = require('portfinder')
const { setRoutes, githubLicense } = require('./suggest')
const GithubApiProvider = require('./github/github-api-provider')

describe('Badge suggestions', function() {
  const githubApiBaseUrl = 'https://api.github.test'
  const apiProvider = new GithubApiProvider({
    baseUrl: githubApiBaseUrl,
    globalToken: 'fake-token',
    withPooling: false,
  })

  describe('GitHub license', function() {
    context('When html_url included in response', function() {
      it('Should link to it', async function() {
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
          path: '/github/license/atom/atom',
          link: 'https://github.com/atom/atom/blob/master/LICENSE.md',
        })

        scope.done()
      })
    })

    context('When html_url not included in response', function() {
      it('Should link to the repo', async function() {
        const scope = nock(githubApiBaseUrl)
          .get('/repos/atom/atom/license')
          .reply(200, {
            license: { key: 'mit' },
          })

        expect(await githubLicense(apiProvider, 'atom', 'atom')).to.deep.equal({
          title: 'GitHub license',
          path: '/github/license/atom/atom',
          link: 'https://github.com/atom/atom',
        })

        scope.done()
      })
    })
  })

  describe('Scoutcamp integration', function() {
    let port, baseUrl
    before(async function() {
      port = await portfinder.getPortPromise()
      baseUrl = `http://127.0.0.1:${port}`
    })

    let camp
    before(async function() {
      camp = Camp.start({ port, hostname: '::' })
      await new Promise(resolve => camp.on('listening', () => resolve()))
    })
    after(async function() {
      if (camp) {
        await new Promise(resolve => camp.close(resolve))
        camp = undefined
      }
    })

    const origin = 'https://example.test'
    before(function() {
      setRoutes([origin], apiProvider, camp)
    })

    context('without an origin header', function() {
      it('returns the expected suggestions', async function() {
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

        const { statusCode, body } = await got(
          `${baseUrl}/$suggest/v1?url=${encodeURIComponent(
            'https://github.com/atom/atom'
          )}`,
          {
            json: true,
          }
        )
        expect(statusCode).to.equal(200)
        expect(body).to.deep.equal({
          suggestions: [
            {
              title: 'GitHub issues',
              link: 'https://github.com/atom/atom/issues',
              path: '/github/issues/atom/atom',
            },
            {
              title: 'GitHub forks',
              link: 'https://github.com/atom/atom/network',
              path: '/github/forks/atom/atom',
            },
            {
              title: 'GitHub stars',
              link: 'https://github.com/atom/atom/stargazers',
              path: '/github/stars/atom/atom',
            },
            {
              title: 'GitHub license',
              path: '/github/license/atom/atom',
              link: 'https://github.com/atom/atom/blob/master/LICENSE.md',
            },
            {
              title: 'Twitter',
              link:
                'https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fatom%2Fatom',
              path: '/twitter/url/https/github.com/atom/atom',
              queryParams: {
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
