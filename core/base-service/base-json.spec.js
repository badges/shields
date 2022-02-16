import Joi from 'joi'
import { expect } from 'chai'
import sinon from 'sinon'
import BaseJsonService from './base-json.js'

const dummySchema = Joi.object({
  requiredString: Joi.string().required(),
}).required()

class DummyJsonService extends BaseJsonService {
  static category = 'cat'
  static route = { base: 'foo' }

  async handle() {
    const { requiredString } = await this._requestJson({
      schema: dummySchema,
      url: 'http://example.com/foo.json',
    })
    return { message: requiredString }
  }
}

describe('BaseJsonService', function () {
  describe('Making requests', function () {
    let requestFetcher
    beforeEach(function () {
      requestFetcher = sinon.stub().returns(
        Promise.resolve({
          buffer: '{"some": "json"}',
          res: { statusCode: 200 },
        })
      )
    })

    it('invokes _requestFetcher', async function () {
      await DummyJsonService.invoke(
        { requestFetcher },
        { handleInternalErrors: false }
      )

      expect(requestFetcher).to.have.been.calledOnceWith(
        'http://example.com/foo.json',
        {
          headers: { Accept: 'application/json' },
        }
      )
    })

    it('forwards options to _requestFetcher', async function () {
      class WithOptions extends DummyJsonService {
        async handle() {
          const { value } = await this._requestJson({
            schema: dummySchema,
            url: 'http://example.com/foo.json',
            options: { method: 'POST', searchParams: { queryParam: 123 } },
          })
          return { message: value }
        }
      }

      await WithOptions.invoke(
        { requestFetcher },
        { handleInternalErrors: false }
      )

      expect(requestFetcher).to.have.been.calledOnceWith(
        'http://example.com/foo.json',
        {
          headers: { Accept: 'application/json' },
          method: 'POST',
          searchParams: { queryParam: 123 },
        }
      )
    })
  })

  describe('Making badges', function () {
    it('handles valid json responses', async function () {
      const requestFetcher = async () => ({
        buffer: '{"requiredString": "some-string"}',
        res: { statusCode: 200 },
      })
      expect(
        await DummyJsonService.invoke(
          { requestFetcher },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        message: 'some-string',
      })
    })

    it('handles json responses which do not match the schema', async function () {
      const requestFetcher = async () => ({
        buffer: '{"unexpectedKey": "some-string"}',
        res: { statusCode: 200 },
      })
      expect(
        await DummyJsonService.invoke(
          { requestFetcher },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'invalid response data',
      })
    })

    it('handles unparseable json responses', async function () {
      const requestFetcher = async () => ({
        buffer: 'not json',
        res: { statusCode: 200 },
      })
      expect(
        await DummyJsonService.invoke(
          { requestFetcher },
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
