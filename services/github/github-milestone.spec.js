import { expect } from 'chai'
import sinon from 'sinon'
import GithubApiProvider from './github-api-provider.js'
import GithubMilestone from './github-milestone.service.js'

describe('GithubMilestone', function () {
  const rateLimitHeaders = {
    'x-ratelimit-limit': 12500,
    'x-ratelimit-remaining': 7955,
    'x-ratelimit-reset': 123456789,
  }

  function invoke({ variant, headers, body }) {
    const requestFetcher = sinon.stub().resolves({
      buffer: JSON.stringify(body),
      res: { statusCode: 200, headers: { ...rateLimitHeaders, ...headers } },
    })
    const githubApiProvider = new GithubApiProvider({
      baseUrl: 'https://github-api.example.com',
      authType: GithubApiProvider.AUTH_TYPES.NO_AUTH,
      restApiVersion: '2022-11-28',
    })
    const result = GithubMilestone.invoke(
      { requestFetcher, githubApiProvider },
      {},
      { variant, user: 'microsoft', repo: 'vscode' },
    )
    return { requestFetcher, result }
  }

  it('counts milestones beyond the first page using the Link header', async function () {
    const { requestFetcher, result } = invoke({
      variant: 'all',
      headers: {
        link: [
          '<https://github-api.example.com/repositories/41881900/milestones?state=all&per_page=1&page=2>; rel="next"',
          '<https://github-api.example.com/repositories/41881900/milestones?state=all&per_page=1&page=411>; rel="last"',
        ].join(', '),
      },
      body: [{ state: 'closed' }],
    })

    expect(await result).to.deep.equal({
      label: 'milestones',
      message: '411',
      color: 'blue',
    })
    expect(requestFetcher).to.have.been.calledOnce
    expect(requestFetcher.firstCall.args[0]).to.equal(
      'https://github-api.example.com/repos/microsoft/vscode/milestones',
    )
    expect(requestFetcher.firstCall.args[1].searchParams).to.deep.equal({
      state: 'all',
      per_page: '1',
    })
  })

  it('counts the response body when there is no Link header', async function () {
    const { result } = invoke({
      variant: 'open',
      headers: {},
      body: [{ state: 'open' }],
    })

    expect(await result).to.deep.equal({
      label: 'active milestones',
      message: '1',
      color: 'red',
    })
  })

  it('reports zero milestones for an empty response', async function () {
    const { result } = invoke({
      variant: 'closed',
      headers: {},
      body: [],
    })

    expect(await result).to.deep.equal({
      label: 'completed milestones',
      message: '0',
      color: 'green',
    })
  })
})
