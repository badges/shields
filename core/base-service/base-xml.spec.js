'use strict'

const Joi = require('@hapi/joi')
const { expect } = require('chai')
const sinon = require('sinon')
const BaseXmlService = require('./base-xml')

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
    let sendAndCacheRequest
    beforeEach(function() {
      sendAndCacheRequest = sinon.stub().returns(
        Promise.resolve({
          buffer: '<requiredString>some-string</requiredString>',
          res: { statusCode: 200 },
        })
      )
    })

    it('invokes _sendAndCacheRequest', async function() {
      await DummyXmlService.invoke(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )

      expect(sendAndCacheRequest).to.have.been.calledOnceWith(
        'http://example.com/foo.xml',
        {
          headers: { Accept: 'application/xml, text/xml' },
        }
      )
    })

    it('forwards options to _sendAndCacheRequest', async function() {
      class WithCustomOptions extends BaseXmlService {
        static get route() {
          return {}
        }

        async handle() {
          const { requiredString } = await this._requestXml({
            schema: dummySchema,
            url: 'http://example.com/foo.xml',
            options: { method: 'POST', qs: { queryParam: 123 } },
          })
          return { message: requiredString }
        }
      }

      await WithCustomOptions.invoke(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )

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
      expect(
        await DummyXmlService.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        message: 'some-string',
      })
    })

    it('parses XML response with custom parser options', async function() {
      const customParserOption = { trimValues: false }
      class DummyXmlServiceWithParserOption extends DummyXmlService {
        async handle() {
          const { requiredString } = await this._requestXml({
            schema: dummySchema,
            url: 'http://example.com/foo.xml',
            parserOptions: customParserOption,
          })
          return { message: requiredString }
        }
      }
      const sendAndCacheRequest = async () => ({
        buffer:
          '<requiredString>some-string with trailing whitespace   </requiredString>',
        res: { statusCode: 200 },
      })
      expect(
        await DummyXmlServiceWithParserOption.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        message: 'some-string with trailing whitespace   ',
      })
    })

    it('handles xml responses which do not match the schema', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: '<unexpectedAttribute>some-string</unexpectedAttribute>',
        res: { statusCode: 200 },
      })
      expect(
        await DummyXmlService.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'invalid response data',
      })
    })

    it('handles unparseable xml responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: 'not xml',
        res: { statusCode: 200 },
      })
      expect(
        await DummyXmlService.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'unparseable xml response',
      })
    })
  })
})
