import { testAuth } from '../test-helpers.js'
import {
  BitbucketRawPullRequests,
  BitbucketNonRawPullRequests,
} from './bitbucket-pull-request.service.js'

const serverConfigOverride = {
  public: {
    services: {
      bitbucketServer: {
        authorizedOrigins: ['https://bitbucket.mydomain.net'],
      },
      bitbucket: {
        authorizedOrigins: ['https://bitbucket.org'],
      },
    },
  },
  private: {
    bitbucket_username: 'must-be-set-for-class-constructor',
    bitbucket_password: 'must-be-set-for-class-constructor',
  },
}

const cloudConfigOverride = {
  public: {
    services: {
      bitbucket: {
        authorizedOrigins: ['https://bitbucket.org'],
      },
      bitbucketServer: {
        authorizedOrigins: [],
      },
    },
  },
}

describe('BitbucketRawPullRequests', function () {
  describe('auth', function () {
    it('sends the auth information to Bitbucket cloud as configured', async function () {
      return testAuth(
        BitbucketRawPullRequests,
        'BasicAuth',
        { size: 42 },
        {
          exampleOverride: { server: undefined },
          configOverride: cloudConfigOverride,
        },
      )
    })

    it('sends the auth information to Bitbucket instence as configured', async function () {
      return testAuth(
        BitbucketRawPullRequests,
        'BasicAuth',
        { size: 42 },
        {
          authOverride: BitbucketRawPullRequests.authServer,
          configOverride: serverConfigOverride,
        },
      )
    })
  })
})

describe('BitbucketNonRawPullRequests', function () {
  describe('auth', function () {
    it('sends the auth information to Bitbucket cloud as configured', async function () {
      return testAuth(
        BitbucketNonRawPullRequests,
        'BasicAuth',
        { size: 42 },
        {
          exampleOverride: { server: undefined },
          configOverride: cloudConfigOverride,
        },
      )
    })

    it('sends the auth information to Bitbucket instence as configured', async function () {
      return testAuth(
        BitbucketNonRawPullRequests,
        'BasicAuth',
        { size: 42 },
        {
          authOverride: BitbucketNonRawPullRequests.authServer,
          configOverride: serverConfigOverride,
        },
      )
    })
  })
})
