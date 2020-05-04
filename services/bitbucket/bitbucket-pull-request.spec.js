'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { cleanUpNockAfterEach, defaultContext } = require('../test-helpers')
const [BitbucketPullRequest] = require('./bitbucket-pull-request.service')

describe('BitbucketPullRequest', function () {
  cleanUpNockAfterEach()

  const user = 'admin'
  const pass = 'password'

  it('Sends auth headers to Bitbucket as configured', async function () {
    const scope = nock('https://bitbucket.org/api/2.0/repositories/')
      .get(/.*/)
      .basicAuth({ user, pass })
      .reply(200, { size: 42 })

    expect(
      await BitbucketPullRequest.invoke(
        defaultContext,
        {
          public: {
            services: {
              bitbucketServer: {
                authorizedOrigins: [],
              },
            },
          },
          private: { bitbucket_username: user, bitbucket_password: pass },
        },
        { user: 'atlassian', repo: 'python-bitbucket' }
      )
    ).to.deep.equal({
      message: '42',
      color: 'yellow',
    })

    scope.done()
  })

  it('Sends auth headers to Bitbucket Server as configured', async function () {
    const scope = nock('https://bitbucket.example.test/rest/api/1.0/projects')
      .get(/.*/)
      .basicAuth({ user, pass })
      .reply(200, { size: 42 })

    expect(
      await BitbucketPullRequest.invoke(
        defaultContext,
        {
          public: {
            services: {
              bitbucketServer: {
                authorizedOrigins: ['https://bitbucket.example.test'],
              },
            },
          },
          private: {
            bitbucket_server_username: user,
            bitbucket_server_password: pass,
          },
        },
        { user: 'project', repo: 'repo' },
        { server: 'https://bitbucket.example.test' }
      )
    ).to.deep.equal({
      message: '42',
      color: 'yellow',
    })

    scope.done()
  })
})
