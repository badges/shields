'use strict'

const Joi = require('joi')
const chai = require('chai')
const { expect } = chai
const sinon = require('sinon')

const BaseJsonService = require('./base-json')
const { invalidJSON } = require('./response-fixtures')
const trace = require('./trace')

chai.use(require('chai-as-promised'))

const dummySchema = Joi.object({
  requiredString: Joi.string().required(),
}).required()

class DummyJsonService extends BaseJsonService {
  static get category() {
    return 'cat'
  }

  static get url() {
    return {
      base: 'foo',
    }
  }

  async handle() {
    const { value } = await this._requestJson({
      schema: dummySchema,
      url: 'http://example.com/foo.json',
    })
    return { message: value }
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

  it('handles unparseable json responses', async function() {
    const sendAndCacheRequest = async () => ({
      buffer: invalidJSON,
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

  context('a schema is not provided', function() {
    it('throws the expected error', async function() {
      const serviceInstance = new DummyJsonService(
        {},
        { handleInternalErrors: false }
      )
      expect(
        serviceInstance._requestJson({ schema: undefined })
      ).to.be.rejectedWith('A Joi schema is required')
    })
  })

  describe('logging', function() {
    let sandbox
    beforeEach(function() {
      sandbox = sinon.createSandbox()
    })
    afterEach(function() {
      sandbox.restore()
    })
    beforeEach(function() {
      sandbox.stub(trace, 'logTrace')
    })

    it('logs valid responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: JSON.stringify({ requiredString: 'bar' }),
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummyJsonService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
      await serviceInstance.invokeHandler({}, {})
      expect(trace.logTrace).to.be.calledWithMatch(
        'validate',
        sinon.match.string,
        'JSON after validation',
        { requiredString: 'bar' },
        { deep: true }
      )
    })

    it('logs invalid responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: JSON.stringify({
          requiredString: ['this', "shouldn't", 'work'],
        }),
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummyJsonService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
      await serviceInstance.invokeHandler({}, {})
      expect(trace.logTrace).to.be.calledWithMatch(
        'validate',
        sinon.match.string,
        'Response did not match schema',
        'child "requiredString" fails because ["requiredString" must be a string]'
      )
    })
  })
})
