import { expect } from 'chai'
import sinon from 'sinon'
import { ImproperlyConfigured } from '../index.js'
import log from '../../core/server/log.js'
import LibrariesIoApiProvider from './librariesio-api-provider.js'

describe('LibrariesIoApiProvider', function () {
  const baseUrl = 'https://libraries.io/api'
  const tokens = ['abc123', 'def456']
  const rateLimit = 60
  const remaining = 57
  const nextReset = 60
  const mockResponse = {
    res: {
      statusCode: 200,
      headers: {
        'x-ratelimit-limit': `${rateLimit}`,
        'x-ratelimit-remaining': `${remaining}`,
        'retry-after': `${nextReset}`,
      },
    },
    buffer: {},
  }

  let token, provider, nextTokenStub
  beforeEach(function () {
    provider = new LibrariesIoApiProvider({ baseUrl, tokens })

    token = {
      update: sinon.spy(),
      invalidate: sinon.spy(),
      decrementedUsesRemaining: remaining - 1,
    }
    nextTokenStub = sinon.stub(provider.standardTokens, 'next').returns(token)
  })

  afterEach(function () {
    sinon.restore()
  })

  context('a core API request', function () {
    const mockResponse = { res: { headers: {} } }
    const mockRequest = sinon.stub().resolves(mockResponse)
    it('should obtain an appropriate token', async function () {
      await provider.fetch(mockRequest, '/npm/badge-maker')
      expect(provider.standardTokens.next).to.have.been.calledOnce
    })

    it('should throw an error when the next token fails', async function () {
      nextTokenStub.throws(Error)
      sinon.stub(log, 'error')
      try {
        await provider.fetch(mockRequest, '/npm/badge-maker')
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(ImproperlyConfigured)
        expect(e.prettyMessage).to.equal(
          'Unable to select next Libraries.io token from pool'
        )
      }
    })
  })

  context('a valid API response', function () {
    const mockRequest = sinon.stub().resolves(mockResponse)
    const tickTime = 123456789

    beforeEach(function () {
      const clock = sinon.useFakeTimers()
      clock.tick(tickTime)
    })

    it('should return the response', async function () {
      const res = await provider.fetch(mockRequest, '/npm/badge-maker')
      expect(Object.is(res, mockResponse)).to.be.true
    })

    it('should update the token with the expected values when headers are present', async function () {
      await provider.fetch(mockRequest, '/npm/badge-maker')

      expect(token.update).to.have.been.calledWith(
        remaining,
        nextReset * 1000 + tickTime
      )
      expect(token.invalidate).not.to.have.been.called
    })

    it('should update the token with the expected values when throttling not applied', async function () {
      const response = {
        res: {
          statusCode: 200,
          headers: {
            'x-ratelimit-limit': rateLimit,
            'x-ratelimit-remaining': remaining,
          },
        },
      }
      const mockRequest = sinon.stub().resolves(response)
      await provider.fetch(mockRequest, '/npm/badge-maker')

      expect(token.update).to.have.been.calledWith(remaining, tickTime)
      expect(token.invalidate).not.to.have.been.called
    })

    it('should update the token with the expected values in 404 case', async function () {
      const response = {
        res: { statusCode: 200, headers: {} },
      }
      const mockRequest = sinon.stub().resolves(response)
      await provider.fetch(mockRequest, '/npm/badge-maker')

      expect(token.update).to.have.been.calledWith(remaining - 1, tickTime)
      expect(token.invalidate).not.to.have.been.called
    })
  })

  context('a connection error', function () {
    const msg = 'connection timeout'
    const requestError = new Error(msg)
    const mockRequest = sinon.stub().rejects(requestError)

    it('should throw an exception', async function () {
      return expect(
        provider.fetch(mockRequest, '/npm/badge-maker', {})
      ).to.be.rejectedWith(Error, 'connection timeout')
    })
  })
})
