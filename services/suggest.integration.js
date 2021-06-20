import { expect } from 'chai'
import Camp from '@shields_io/camp'
import portfinder from 'portfinder'
import config from 'config'
import got from '../core/got-test-client.js'
import { setRoutes } from './suggest.js'
import GithubApiProvider from './github/github-api-provider.js'

describe('Badge suggestions for', function () {
  const githubApiBaseUrl = process.env.GITHUB_URL || 'https://api.github.com'

  let token, apiProvider
  before(function () {
    token = config.util.toObject().private.gh_token
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
  before(async function () {
    port = await portfinder.getPortPromise()
    baseUrl = `http://127.0.0.1:${port}`
  })

  let camp
  before(async function () {
    camp = Camp.start({ port, hostname: '::' })
    await new Promise(resolve => camp.on('listening', () => resolve()))
  })
  after(async function () {
    if (camp) {
      await new Promise(resolve => camp.close(resolve))
      camp = undefined
    }
  })

  const origin = 'https://example.test'
  before(function () {
    setRoutes([origin], apiProvider, camp)
  })
  describe('GitHub', function () {
    context('with an existing project', function () {
      it('returns the expected suggestions', async function () {
        const { statusCode, body } = await got(
          `${baseUrl}/$suggest/v1?url=${encodeURIComponent(
            'https://github.com/atom/atom'
          )}`,
          {
            responseType: 'json',
          }
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
      })
    })

    context('with a non-existent project', function () {
      it('returns the expected suggestions', async function () {
        this.timeout(5000)

        const { statusCode, body } = await got(
          `${baseUrl}/$suggest/v1?url=${encodeURIComponent(
            'https://github.com/badges/not-a-real-project'
          )}`,
          {
            responseType: 'json',
          }
        )
        expect(statusCode).to.equal(200)
        expect(body).to.deep.equal({
          suggestions: [
            {
              title: 'GitHub issues',
              link: 'https://github.com/badges/not-a-real-project/issues',
              example: {
                pattern: '/github/issues/:user/:repo',
                namedParams: { user: 'badges', repo: 'not-a-real-project' },
                queryParams: {},
              },
            },
            {
              title: 'GitHub forks',
              link: 'https://github.com/badges/not-a-real-project/network',
              example: {
                pattern: '/github/forks/:user/:repo',
                namedParams: { user: 'badges', repo: 'not-a-real-project' },
                queryParams: {},
              },
            },
            {
              title: 'GitHub stars',
              link: 'https://github.com/badges/not-a-real-project/stargazers',
              example: {
                pattern: '/github/stars/:user/:repo',
                namedParams: { user: 'badges', repo: 'not-a-real-project' },
                queryParams: {},
              },
            },
            {
              title: 'GitHub license',
              link: 'https://github.com/badges/not-a-real-project',
              example: {
                pattern: '/github/license/:user/:repo',
                namedParams: { user: 'badges', repo: 'not-a-real-project' },
                queryParams: {},
              },
            },
            {
              title: 'Twitter',
              link: 'https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fbadges%2Fnot-a-real-project',
              example: {
                pattern: '/twitter/url',
                namedParams: {},
                queryParams: {
                  url: 'https://github.com/badges/not-a-real-project',
                },
              },
              preview: {
                style: 'social',
              },
            },
          ],
        })
      })
    })
  })

  describe('GitLab', function () {
    context('with an existing project', function () {
      it('returns the expected suggestions', async function () {
        const { statusCode, body } = await got(
          `${baseUrl}/$suggest/v1?url=${encodeURIComponent(
            'https://gitlab.com/gitlab-org/gitlab'
          )}`,
          {
            responseType: 'json',
          }
        )
        expect(statusCode).to.equal(200)
        expect(body).to.deep.equal({
          suggestions: [
            {
              title: 'GitLab pipeline',
              link: 'https://gitlab.com/gitlab-org/gitlab/builds',
              example: {
                pattern: '/gitlab/pipeline/:user/:repo',
                namedParams: { user: 'gitlab-org', repo: 'gitlab' },
                queryParams: {},
              },
            },
            {
              title: 'Twitter',
              link: 'https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgitlab.com%2Fgitlab-org%2Fgitlab',
              example: {
                pattern: '/twitter/url',
                namedParams: {},
                queryParams: {
                  url: 'https://gitlab.com/gitlab-org/gitlab',
                },
              },
              preview: {
                style: 'social',
              },
            },
          ],
        })
      })
    })

    context('with an nonexisting project', function () {
      it('returns the expected suggestions', async function () {
        const { statusCode, body } = await got(
          `${baseUrl}/$suggest/v1?url=${encodeURIComponent(
            'https://gitlab.com/gitlab-org/not-gitlab'
          )}`,
          {
            responseType: 'json',
          }
        )
        expect(statusCode).to.equal(200)
        expect(body).to.deep.equal({
          suggestions: [
            {
              title: 'GitLab pipeline',
              link: 'https://gitlab.com/gitlab-org/not-gitlab/builds',
              example: {
                pattern: '/gitlab/pipeline/:user/:repo',
                namedParams: { user: 'gitlab-org', repo: 'not-gitlab' },
                queryParams: {},
              },
            },
            {
              title: 'Twitter',
              link: 'https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgitlab.com%2Fgitlab-org%2Fnot-gitlab',
              example: {
                pattern: '/twitter/url',
                namedParams: {},
                queryParams: {
                  url: 'https://gitlab.com/gitlab-org/not-gitlab',
                },
              },
              preview: {
                style: 'social',
              },
            },
          ],
        })
      })
    })
  })
})
