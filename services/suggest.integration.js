'use strict'

const { expect } = require('chai')
const got = require('got')
const Camp = require('camp')
const portfinder = require('portfinder')
const { setRoutes } = require('./suggest')
const GithubApiProvider = require('./github/github-api-provider')
const serverSecrets = require('../lib/server-secrets')

describe('GitHub badge suggestions', function() {
  const githubApiBaseUrl = process.env.GITHUB_URL || 'https://api.github.com'

  let token, apiProvider
  before(function() {
    token = serverSecrets.gh_token
    if (!token) {
      throw Error('The integration tests require a gh_token to be set')
    }
    apiProvider = new GithubApiProvider({
      baseUrl: githubApiBaseUrl,
      globalToken: token,
      withPooling: false,
    })
  })

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

  context('with an existing project', function() {
    it('returns the expected suggestions', async function() {
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
    })
  })

  context('with a non-existent project', function() {
    it('returns the expected suggestions', async function() {
      this.timeout(5000)

      const { statusCode, body } = await got(
        `${baseUrl}/$suggest/v1?url=${encodeURIComponent(
          'https://github.com/badges/not-a-real-project'
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
            link: 'https://github.com/badges/not-a-real-project/issues',
            path: '/github/issues/badges/not-a-real-project',
          },
          {
            title: 'GitHub forks',
            link: 'https://github.com/badges/not-a-real-project/network',
            path: '/github/forks/badges/not-a-real-project',
          },
          {
            title: 'GitHub stars',
            link: 'https://github.com/badges/not-a-real-project/stargazers',
            path: '/github/stars/badges/not-a-real-project',
          },
          {
            title: 'GitHub license',
            path: '/github/license/badges/not-a-real-project',
            link: 'https://github.com/badges/not-a-real-project',
          },
          {
            title: 'Twitter',
            link:
              'https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fbadges%2Fnot-a-real-project',
            path: '/twitter/url/https/github.com/badges/not-a-real-project',
            queryParams: {
              style: 'social',
            },
          },
        ],
      })
    })
  })
})
