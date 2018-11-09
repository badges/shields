'use strict'

const Joi = require('joi')
const chai = require('chai')
const { expect } = chai
const sinon = require('sinon')

const BaseXmlService = require('./base-xml')

chai.use(require('chai-as-promised'))

const dummySchema = Joi.object({
  requiredString: Joi.string().required(),
}).required()

class DummyXmlService extends BaseXmlService {
  static get category() {
    return 'cat'
  }

  static get route() {
    return {
      base: 'foo',
    }
  }

  async handle() {
    const { requiredString } = await this._requestXml({
      schema: dummySchema,
      url: 'http://example.com/foo.xml',
    })
    return { message: requiredString }
  }
}

describe('BaseXmlService', function() {
  describe('Making requests', function() {
    let sendAndCacheRequest, serviceInstance
    beforeEach(function() {
      sendAndCacheRequest = sinon.stub().returns(
        Promise.resolve({
          buffer: '<requiredString>some-string</requiredString>',
          res: { statusCode: 200 },
        })
      )
      serviceInstance = new DummyXmlService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
    })

    it('invokes _sendAndCacheRequest', async function() {
      await serviceInstance.invokeHandler({}, {})

      expect(sendAndCacheRequest).to.have.been.calledOnceWith(
        'http://example.com/foo.xml',
        {
          headers: { Accept: 'application/xml, text/xml' },
        }
      )
    })

    it('forwards options to _sendAndCacheRequest', async function() {
      Object.assign(serviceInstance, {
        async handle() {
          const { value } = await this._requestXml({
            schema: dummySchema,
            url: 'http://example.com/foo.xml',
            options: { method: 'POST', qs: { queryParam: 123 } },
          })
          return { message: value }
        },
      })

      await serviceInstance.invokeHandler({}, {})

      expect(sendAndCacheRequest).to.have.been.calledOnceWith(
        'http://example.com/foo.xml',
        {
          headers: { Accept: 'application/xml, text/xml' },
          method: 'POST',
          qs: { queryParam: 123 },
        }
      )
    })
  })

  describe('Making badges', function() {
    it('handles valid xml responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: '<requiredString>some-string</requiredString>',
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummyXmlService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
      const serviceData = await serviceInstance.invokeHandler({}, {})
      expect(serviceData).to.deep.equal({
        message: 'some-string',
      })
    })

    it('handles xml responses which do not match the schema', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: '<unexpectedAttribute>some-string</unexpectedAttribute>',
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummyXmlService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
      const serviceData = await serviceInstance.invokeHandler({}, {})
      expect(serviceData).to.deep.equal({
        color: 'lightgray',
        message: 'invalid response data',
      })
    })

    it('handles unparseable xml responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: 'not xml',
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummyXmlService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
      const serviceData = await serviceInstance.invokeHandler({}, {})
      expect(serviceData).to.deep.equal({
        color: 'lightgray',
        message: 'unparseable xml response',
      })
    })
  })
})
