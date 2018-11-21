'use strict'

const Joi = require('joi')
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
    let sendAndCacheRequest, serviceInstance
    beforeEach(function() {
      sendAndCacheRequest = sinon.stub().returns(
        Promise.resolve({
          buffer: '{"some": "json"}',
          res: { statusCode: 200 },
        })
      )
      serviceInstance = new DummyJsonService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
    })

    it('invokes _sendAndCacheRequest', async function() {
      await serviceInstance.invokeHandler({}, {})

      expect(sendAndCacheRequest).to.have.been.calledOnceWith(
        'http://example.com/foo.json',
        {
          headers: { Accept: 'application/json' },
        }
      )
    })

    it('forwards options to _sendAndCacheRequest', async function() {
      Object.assign(serviceInstance, {
        async handle() {
          const { value } = await this._requestJson({
            schema: dummySchema,
            url: 'http://example.com/foo.json',
            options: { method: 'POST', qs: { queryParam: 123 } },
          })
          return { message: value }
        },
      })

      await serviceInstance.invokeHandler({}, {})

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
      const serviceInstance = new DummyJsonService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
      const serviceData = await serviceInstance.invokeHandler({}, {})
      expect(serviceData).to.deep.equal({
        message: 'some-string',
      })
    })

    it('handles json responses which do not match the schema', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: '{"unexpectedKey": "some-string"}',
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummyJsonService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
      const serviceData = await serviceInstance.invokeHandler({}, {})
      expect(serviceData).to.deep.equal({
        color: 'lightgray',
        message: 'invalid response data',
      })
    })

    it('handles unparseable json responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: 'not json',
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummyJsonService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
      const serviceData = await serviceInstance.invokeHandler({}, {})
      expect(serviceData).to.deep.equal({
        color: 'lightgray',
        message: 'unparseable json response',
      })
    })
  })
})
