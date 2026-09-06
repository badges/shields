import { expect } from 'chai'
import sinon from 'sinon'
import { test, given } from 'sazerac'
import '../../core/register-chai-plugins.spec.js'
import GithubApiProvider from './github-api-provider.js'
import GithubCheckRuns from './github-check-runs.service.js'

const mockCheckRunsResponse = {
  total_count: 1,
  check_runs: [
    { name: 'test-lint', status: 'completed', conclusion: 'success' },
  ],
}

const rateLimitHeaders = {
  'x-ratelimit-limit': 5000,
  'x-ratelimit-remaining': 4999,
  'x-ratelimit-reset': 123456789,
}

async function invokeWithMockRequest(nameFilter) {
  const requestFetcher = sinon.stub().returns(
    Promise.resolve({
      buffer: JSON.stringify(mockCheckRunsResponse),
      res: {
        statusCode: 200,
        headers: rateLimitHeaders,
      },
    }),
  )
  const githubApiProvider = new GithubApiProvider({
    baseUrl: 'https://github-api.example.com',
    authType: GithubApiProvider.AUTH_TYPES.TOKEN_POOL,
    restApiVersion: '2022-11-28',
  })
  const mockToken = {
    update: sinon.mock(),
    invalidate: sinon.mock(),
    recordFailedAttempt: sinon.mock(),
    resetFailedAttempts: sinon.mock(),
  }
  sinon.stub(githubApiProvider.standardTokens, 'next').returns(mockToken)

  const queryParams = nameFilter ? { nameFilter } : {}
  await GithubCheckRuns.invoke(
    { requestFetcher, githubApiProvider },
    { handleInternalErrors: false },
    { user: 'badges', repo: 'shields', ref: 'master' },
    queryParams,
  )
  return requestFetcher
}

describe('GithubCheckRuns handle', function () {
  it('passes check_name to GitHub API when nameFilter is provided', async function () {
    const requestFetcher = await invokeWithMockRequest('test-lint')

    expect(requestFetcher).to.have.been.calledOnceWith(
      'https://github-api.example.com/repos/badges/shields/commits/master/check-runs',
      sinon.match({
        searchParams: { check_name: 'test-lint' },
      }),
    )
  })

  it('does not pass check_name when nameFilter is omitted', async function () {
    const requestFetcher = await invokeWithMockRequest()

    expect(requestFetcher).to.have.been.calledOnce
    const [, options] = requestFetcher.firstCall.args
    expect(options.searchParams).to.be.undefined
  })
})

describe('GithubCheckRuns.transform', function () {
  test(GithubCheckRuns.transform, () => {
    given(
      {
        total_count: 3,
        check_runs: [
          { status: 'completed', conclusion: 'success' },
          { status: 'completed', conclusion: 'failure' },
          { status: 'in_progress', conclusion: null },
        ],
      },
      '',
    ).expect({
      total: 3,
      statusCounts: { completed: 2, in_progress: 1 },
      conclusionCounts: { success: 1, failure: 1, null: 1 },
    })

    given(
      {
        total_count: 3,
        check_runs: [
          { name: 'test1', status: 'completed', conclusion: 'success' },
          { name: 'test2', status: 'completed', conclusion: 'failure' },
          { name: 'test3', status: 'in_progress', conclusion: null },
        ],
      },
      '',
    ).expect({
      total: 3,
      statusCounts: { completed: 2, in_progress: 1 },
      conclusionCounts: { success: 1, failure: 1, null: 1 },
    })

    given(
      {
        total_count: 3,
        check_runs: [
          { name: 'test1', status: 'completed', conclusion: 'success' },
          { name: 'test2', status: 'completed', conclusion: 'failure' },
          { name: 'test3', status: 'in_progress', conclusion: null },
        ],
      },
      'test1',
    ).expect({
      total: 1,
      statusCounts: { completed: 1 },
      conclusionCounts: { success: 1 },
    })

    given(
      {
        total_count: 3,
        check_runs: [
          { name: 'test1', status: 'completed', conclusion: 'success' },
          { name: 'test2', status: 'completed', conclusion: 'failure' },
          { name: 'test3', status: 'in_progress', conclusion: null },
        ],
      },
      'missing',
    ).expect({
      total: 0,
      statusCounts: {},
      conclusionCounts: {},
    })
  })
})

describe('GithubCheckRuns', function () {
  test(GithubCheckRuns.mapState, () => {
    given({
      total: 0,
      statusCounts: null,
      conclusionCounts: null,
    }).expect('no check runs')
    given({
      total: 1,
      statusCounts: { queued: 1 },
      conclusionCounts: null,
    }).expect('queued')
    given({
      total: 1,
      statusCounts: { in_progress: 1 },
      conclusionCounts: null,
    }).expect('pending')
    given({
      total: 1,
      statusCounts: { waiting: 1 },
      conclusionCounts: null,
    }).expect('queued')
    given({
      total: 1,
      statusCounts: { pending: 1 },
      conclusionCounts: null,
    }).expect('pending')
    given({
      total: 1,
      statusCounts: { completed: 1 },
      conclusionCounts: { success: 1 },
    }).expect('passing')
    given({
      total: 2,
      statusCounts: { completed: 2 },
      conclusionCounts: { success: 1, stale: 1 },
    }).expect('partially succeeded')
    given({
      total: 3,
      statusCounts: { completed: 3 },
      conclusionCounts: { success: 1, stale: 1, failure: 1 },
    }).expect('failing')
    given({
      total: 1,
      statusCounts: { somethingelse: 1 },
      conclusionCounts: null,
    }).expect('unknown status')
  })
})
