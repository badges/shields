import Joi from 'joi'
import { expect } from 'chai'
import sinon from 'sinon'
import BaseXmlService from './base-xml.js'

const dummySchema = Joi.object({
  requiredString: Joi.string().required(),
}).required()

class DummyXmlService extends BaseXmlService {
  static category = 'cat'
  static route = { base: 'foo' }

  async handle() {
    const { requiredString } = await this._requestXml({
      schema: dummySchema,
      url: 'http://example.com/foo.xml',
    })
    return { message: requiredString }
  }
}

describe('BaseXmlService', function () {
  describe('Making requests', function () {
    let requestFetcher
    beforeEach(function () {
      requestFetcher = sinon.stub().returns(
        Promise.resolve({
          buffer: '<requiredString>some-string</requiredString>',
          res: { statusCode: 200 },
        })
      )
    })

    it('invokes _requestFetcher', async function () {
      await DummyXmlService.invoke(
        { requestFetcher },
        { handleInternalErrors: false }
      )

      expect(requestFetcher).to.have.been.calledOnceWith(
        'http://example.com/foo.xml',
        {
          headers: { Accept: 'application/xml, text/xml' },
        }
      )
    })

    it('forwards options to _requestFetcher', async function () {
      class WithCustomOptions extends BaseXmlService {
        static route = {}

        async handle() {
          const { requiredString } = await this._requestXml({
            schema: dummySchema,
            url: 'http://example.com/foo.xml',
            options: { method: 'POST', searchParams: { queryParam: 123 } },
          })
          return { message: requiredString }
        }
      }

      await WithCustomOptions.invoke(
        { requestFetcher },
        { handleInternalErrors: false }
      )

      expect(requestFetcher).to.have.been.calledOnceWith(
        'http://example.com/foo.xml',
        {
          headers: { Accept: 'application/xml, text/xml' },
          method: 'POST',
          searchParams: { queryParam: 123 },
        }
      )
    })
  })

  describe('Making badges', function () {
    it('handles valid xml responses', async function () {
      const requestFetcher = async () => ({
        buffer: '<requiredString>some-string</requiredString>',
        res: { statusCode: 200 },
      })
      expect(
        await DummyXmlService.invoke(
          { requestFetcher },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        message: 'some-string',
      })
    })

    it('parses XML response with custom parser options', async function () {
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
      const requestFetcher = async () => ({
        buffer:
          '<requiredString>some-string with trailing whitespace   </requiredString>',
        res: { statusCode: 200 },
      })
      expect(
        await DummyXmlServiceWithParserOption.invoke(
          { requestFetcher },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        message: 'some-string with trailing whitespace   ',
      })
    })

    it('handles xml responses which do not match the schema', async function () {
      const requestFetcher = async () => ({
        buffer: '<unexpectedAttribute>some-string</unexpectedAttribute>',
        res: { statusCode: 200 },
      })
      expect(
        await DummyXmlService.invoke(
          { requestFetcher },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'invalid response data',
      })
    })

    it('handles unparseable xml responses', async function () {
      const requestFetcher = async () => ({
        buffer: 'not xml',
        res: { statusCode: 200 },
      })
      expect(
        await DummyXmlService.invoke(
          { requestFetcher },
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
