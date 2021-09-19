import Joi from 'joi'
import { expect } from 'chai'
import sinon from 'sinon'
import { GithubAuthV3Service } from './github-auth-service.js'
import GithubApiProvider from './github-api-provider.js'

describe('GithubAuthV3Service', function () {
  class DummyGithubAuthV3Service extends GithubAuthV3Service {
    static category = 'build'
    static route = { base: 'runs' }

    async handle() {
      const { requiredString } = await this._requestJson({
        schema: Joi.object({
          requiredString: Joi.string().required(),
        }).required(),
        url: 'https://github-api.example.com/repos/badges/shields/check-runs',
        options: {
          headers: {
            Accept: 'application/vnd.github.antiope-preview+json',
          },
        },
      })
      return { message: requiredString }
    }
  }

  class ScopedDummyGithubAuthV3Service extends DummyGithubAuthV3Service {
    constructor(context, config) {
      super(context, config, { needsPackageScope: true })
    }
  }

  let sendAndCacheRequestWithCallbacks, mockToken
  const githubApiProvider = new GithubApiProvider({
    baseUrl: 'https://github-api.example.com',
  })

  beforeEach(function () {
    sendAndCacheRequestWithCallbacks = sinon.stub().returns(
      Promise.resolve({
        buffer: '{"requiredString": "some-string"}',
        res: { statusCode: 200 },
      })
    )
    mockToken = { id: 'abc123', update: sinon.mock(), invalidate: sinon.mock() }
  })

  afterEach(function () {
    sinon.restore()
  })

  it('forwards custom Accept header', async function () {
    sinon.stub(githubApiProvider.standardTokens, 'next').returns(mockToken)

    DummyGithubAuthV3Service.invoke({
      sendAndCacheRequestWithCallbacks,
      githubApiProvider,
    })

    expect(sendAndCacheRequestWithCallbacks).to.have.been.calledOnceWith({
      headers: {
        'User-Agent': 'Shields.io/2003a',
        Accept: 'application/vnd.github.antiope-preview+json',
        Authorization: 'token abc123',
      },
      url: 'https://github-api.example.com/repos/badges/shields/check-runs',
      baseUrl: 'https://github-api.example.com',
    })
  })

  it('uses token with correct read scope', function () {
    sinon.stub(githubApiProvider.packageScopedTokens, 'next').returns(mockToken)

    ScopedDummyGithubAuthV3Service.invoke({
      sendAndCacheRequestWithCallbacks,
      githubApiProvider,
    })

    expect(sendAndCacheRequestWithCallbacks).to.have.been.calledOnceWith({
      headers: {
        'User-Agent': 'Shields.io/2003a',
        Accept: 'application/vnd.github.antiope-preview+json',
        Authorization: 'token abc123',
      },
      url: 'https://github-api.example.com/repos/badges/shields/check-runs',
      baseUrl: 'https://github-api.example.com',
    })
  })
})
