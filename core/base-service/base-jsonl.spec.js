import Joi from 'joi'
import { expect } from 'chai'
import sinon from 'sinon'
import BaseJsonlService from './base-jsonl.js'

const lineSchema = Joi.object({
  requiredString: Joi.string().required(),
}).required()

class DummyJsonlService extends BaseJsonlService {
  static category = 'cat'
  static route = { base: 'foo' }

  async handle() {
    const [{ requiredString }] = await this._requestJsonl({
      schema: lineSchema,
      url: 'http://example.com/foo.jsonl',
    })
    return { message: requiredString }
  }
}

const expectedJsonl = `
{"requiredString":"some-string"}
{"requiredString":"another-string"}
`

const unexpectedJsonl = `
{"unexpectedKey":"some-string"}
`

describe('BaseJsonlService', function () {
  describe('Making requests', function () {
    let requestFetcher
    beforeEach(function () {
      requestFetcher = sinon.stub().returns(
        Promise.resolve({
          buffer: expectedJsonl,
          res: { statusCode: 200 },
        }),
      )
    })

    it('invokes _requestFetcher', async function () {
      await DummyJsonlService.invoke(
        { requestFetcher },
        { handleInternalErrors: false },
      )

      sinon.assert.calledOnceWithExactly(
        requestFetcher,
        'http://example.com/foo.jsonl',
        {
          headers: {
            Accept: 'application/jsonl, application/x-ndjson, text/plain',
          },
        },
        {},
      )
    })

    it('forwards options to _requestFetcher', async function () {
      class WithOptions extends DummyJsonlService {
        async handle() {
          const [{ requiredString }] = await this._requestJsonl({
            schema: lineSchema,
            url: 'http://example.com/foo.jsonl',
            options: { method: 'POST', searchParams: { queryParam: 123 } },
          })
          return { message: requiredString }
        }
      }

      await WithOptions.invoke(
        { requestFetcher },
        { handleInternalErrors: false },
      )

      sinon.assert.calledOnceWithExactly(
        requestFetcher,
        'http://example.com/foo.jsonl',
        {
          headers: {
            Accept: 'application/jsonl, application/x-ndjson, text/plain',
          },
          method: 'POST',
          searchParams: { queryParam: 123 },
        },
        {},
      )
    })
  })

  describe('Making badges', function () {
    it('handles valid jsonl responses', async function () {
      const requestFetcher = async () => ({
        buffer: expectedJsonl,
        res: { statusCode: 200 },
      })
      expect(
        await DummyJsonlService.invoke(
          { requestFetcher },
          { handleInternalErrors: false },
        ),
      ).to.deep.equal({
        message: 'some-string',
      })
    })

    it('handles jsonl responses which do not match the schema', async function () {
      const requestFetcher = async () => ({
        buffer: unexpectedJsonl,
        res: { statusCode: 200 },
      })
      expect(
        await DummyJsonlService.invoke(
          { requestFetcher },
          { handleInternalErrors: false },
        ),
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'invalid response data',
      })
    })

    it('handles unparseable jsonl responses', async function () {
      const requestFetcher = async () => ({
        buffer: 'not json',
        res: { statusCode: 200 },
      })
      expect(
        await DummyJsonlService.invoke(
          { requestFetcher },
          { handleInternalErrors: false },
        ),
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'unparseable jsonl response',
      })
    })
  })
})
