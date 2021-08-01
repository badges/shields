import { test, given, forCases } from 'sazerac'
import {
  parseGithubPullRequestUrl,
  inferPullRequest,
} from './infer-pull-request.js'

describe('Pull request inference', function () {
  test(parseGithubPullRequestUrl, () => {
    forCases([
      given('https://github.com/badges/shields/pull/1234'),
      given('https://github.com/badges/shields/pull/1234', {
        verifyBaseUrl: 'https://github.com',
      }),
    ]).expect({
      baseUrl: 'https://github.com',
      owner: 'badges',
      repo: 'shields',
      pullRequest: 1234,
      slug: 'badges/shields#1234',
    })

    given('https://github.com/badges/shields/pull/1234', {
      verifyBaseUrl: 'https://example.com',
    }).expectError(
      'Expected base URL to be https://example.com but got https://github.com'
    )
  })

  test(inferPullRequest, () => {
    const expected = {
      owner: 'badges',
      repo: 'shields',
      pullRequest: 1234,
      slug: 'badges/shields#1234',
    }

    given({
      CIRCLECI: '1',
      CI_PULL_REQUEST: 'https://github.com/badges/shields/pull/1234',
    }).expect(Object.assign({ baseUrl: 'https://github.com' }, expected))

    given({
      TRAVIS: '1',
      TRAVIS_REPO_SLUG: 'badges/shields',
      TRAVIS_PULL_REQUEST: '1234',
    }).expect(expected)
  })
})
