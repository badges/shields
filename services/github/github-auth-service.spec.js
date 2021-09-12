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

  it('forwards custom Accept header', async function () {
    const sendAndCacheRequestWithCallbacks = sinon.stub().returns(
      Promise.resolve({
        buffer: '{"requiredString": "some-string"}',
        res: { statusCode: 200 },
      })
    )
    const githubApiProvider = new GithubApiProvider({
      baseUrl: 'https://github-api.example.com',
    })
    const mockToken = { update: sinon.mock(), invalidate: sinon.mock() }
    sinon.stub(githubApiProvider.standardTokens, 'next').returns(mockToken)

    DummyGithubAuthV3Service.invoke({
      sendAndCacheRequestWithCallbacks,
      githubApiProvider,
    })

    expect(sendAndCacheRequestWithCallbacks).to.have.been.calledOnceWith({
      headers: {
        'User-Agent': 'Shields.io/2003a',
        Accept: 'application/vnd.github.antiope-preview+json',
        Authorization: 'token undefined',
      },
      url: 'https://github-api.example.com/repos/badges/shields/check-runs',
      baseUrl: 'https://github-api.example.com',
    })
  })
})
