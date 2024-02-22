import { testAuth } from '../test-helpers.js'
import {
  BitbucketRawPullRequests,
  BitbucketNonRawPullRequests,
} from './bitbucket-pull-request.service.js'

describe('BitbucketRawPullRequests', function () {
  describe('auth', function () {
    it('sends the auth information to Bitbucket cloud as configured', async function () {
      return testAuth(
        BitbucketRawPullRequests,
        'BasicAuth',
        { size: 42 },
        { exampleOverride: { server: undefined } },
      )
    })

    it('sends the auth information to Bitbucket instence as configured', async function () {
      return testAuth(BitbucketRawPullRequests, 'BasicAuth', { size: 42 })
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
        { exampleOverride: { server: undefined } },
      )
    })

    it('sends the auth information to Bitbucket instence as configured', async function () {
      return testAuth(BitbucketNonRawPullRequests, 'BasicAuth', { size: 42 })
    })
  })
})
