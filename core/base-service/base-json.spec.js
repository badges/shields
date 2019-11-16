'use strict'

const Joi = require('@hapi/joi')
const { expect } = require('chai')
const sinon = require('sinon')
const BaseJsonService = require('./base-json')

const dummySchema = Joi.object({
  requiredString: Joi.string().required(),
}).required()

class DummyJsonService extends BaseJsonService {
  static get category() {
    return 'cat'
  }

  static get route() {
    return {
      base: 'foo',
    }
  }

  async handle() {
    const { requiredString } = await this._requestJson({
      schema: dummySchema,
      url: 'http://example.com/foo.json',
    })
    return { message: requiredString }
  }
}

describe('BaseJsonService', function() {
  describe('Making requests', function() {
    let sendAndCacheRequest
    beforeEach(function() {
      sendAndCacheRequest = sinon.stub().returns(
        Promise.resolve({
          buffer: '{"some": "json"}',
          res: { statusCode: 200 },
        })
      )
    })

    it('invokes _sendAndCacheRequest', async function() {
      await DummyJsonService.invoke(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )

      expect(sendAndCacheRequest).to.have.been.calledOnceWith(
        'http://example.com/foo.json',
        {
          headers: { Accept: 'application/json' },
        }
      )
    })

    it('forwards options to _sendAndCacheRequest', async function() {
      class WithOptions extends DummyJsonService {
        async handle() {
          const { value } = await this._requestJson({
            schema: dummySchema,
            url: 'http://example.com/foo.json',
            options: { method: 'POST', qs: { queryParam: 123 } },
          })
          return { message: value }
        }
      }

      await WithOptions.invoke(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )

      expect(sendAndCacheRequest).to.have.been.calledOnceWith(
        'http://example.com/foo.json',
        {
          headers: { Accept: 'application/json' },
          method: 'POST',
          qs: { queryParam: 123 },
        }
      )
    })
  })

  describe('Making badges', function() {
    it('handles valid json responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: '{"requiredString": "some-string"}',
        res: { statusCode: 200 },
      })
      expect(
        await DummyJsonService.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        message: 'some-string',
      })
    })

    it('handles json responses which do not match the schema', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: '{"unexpectedKey": "some-string"}',
        res: { statusCode: 200 },
      })
      expect(
        await DummyJsonService.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'invalid response data',
      })
    })

    it('handles unparseable json responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: 'not json',
        res: { statusCode: 200 },
      })
      expect(
        await DummyJsonService.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'unparseable json response',
      })
    })
  })
})
