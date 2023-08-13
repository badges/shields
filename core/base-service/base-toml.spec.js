import Joi from 'joi'
import { expect } from 'chai'
import sinon from 'sinon'
import BaseTomlService from './base-toml.js'

const dummySchema = Joi.object({
  requiredString: Joi.string().required(),
}).required()

class DummyTomlService extends BaseTomlService {
  static category = 'cat'
  static route = { base: 'foo' }

  async handle() {
    const { requiredString } = await this._requestToml({
      schema: dummySchema,
      url: 'http://example.com/foo.toml',
    })
    return { message: requiredString }
  }
}

const expectedToml = `
# example toml
requiredString = "some-string"
`

const invalidSchemaToml = `
# example toml - legal toml syntax but invalid schema
unexpectedKey = "some-string"
`

const invalidTomlSyntax = `
# example illegal toml syntax that can't be parsed
missing= "space"
colonsCantBeUsed: 42
missing "assignment"
`

describe('BaseTomlService', function () {
  describe('Making requests', function () {
    let requestFetcher
    beforeEach(function () {
      requestFetcher = sinon.stub().returns(
        Promise.resolve({
          buffer: expectedToml,
          res: { statusCode: 200 },
        }),
      )
    })

    it('invokes _requestFetcher', async function () {
      await DummyTomlService.invoke(
        { requestFetcher },
        { handleInternalErrors: false },
      )

      expect(requestFetcher).to.have.been.calledOnceWith(
        'http://example.com/foo.toml',
        {
          headers: {
            Accept:
              'text/x-toml, text/toml, application/x-toml, application/toml, text/plain',
          },
        },
      )
    })

    it('forwards options to _requestFetcher', async function () {
      class WithOptions extends DummyTomlService {
        async handle() {
          const { requiredString } = await this._requestToml({
            schema: dummySchema,
            url: 'http://example.com/foo.toml',
            options: { method: 'POST', searchParams: { queryParam: 123 } },
          })
          return { message: requiredString }
        }
      }

      await WithOptions.invoke(
        { requestFetcher },
        { handleInternalErrors: false },
      )

      expect(requestFetcher).to.have.been.calledOnceWith(
        'http://example.com/foo.toml',
        {
          headers: {
            Accept:
              'text/x-toml, text/toml, application/x-toml, application/toml, text/plain',
          },
          method: 'POST',
          searchParams: { queryParam: 123 },
        },
      )
    })
  })

  describe('Making badges', function () {
    it('handles valid toml responses', async function () {
      const requestFetcher = async () => ({
        buffer: expectedToml,
        res: { statusCode: 200 },
      })
      expect(
        await DummyTomlService.invoke(
          { requestFetcher },
          { handleInternalErrors: false },
        ),
      ).to.deep.equal({
        message: 'some-string',
      })
    })

    it('handles toml responses which do not match the schema', async function () {
      const requestFetcher = async () => ({
        buffer: invalidSchemaToml,
        res: { statusCode: 200 },
      })
      expect(
        await DummyTomlService.invoke(
          { requestFetcher },
          { handleInternalErrors: false },
        ),
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'invalid response data',
      })
    })

    it('handles unparseable toml responses', async function () {
      const requestFetcher = async () => ({
        buffer: invalidTomlSyntax,
        res: { statusCode: 200 },
      })
      expect(
        await DummyTomlService.invoke(
          { requestFetcher },
          { handleInternalErrors: false },
        ),
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'unparseable toml response',
      })
    })
  })
})
