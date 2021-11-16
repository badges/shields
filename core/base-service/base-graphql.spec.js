import Joi from 'joi'
import { expect } from 'chai'
import gql from 'graphql-tag'
import sinon from 'sinon'
import BaseGraphqlService from './base-graphql.js'
import { InvalidResponse } from './errors.js'

const dummySchema = Joi.object({
  requiredString: Joi.string().required(),
}).required()

class DummyGraphqlService extends BaseGraphqlService {
  static category = 'cat'
  static route = { base: 'foo' }

  async handle() {
    const { requiredString } = await this._requestGraphql({
      schema: dummySchema,
      url: 'http://example.com/graphql',
      query: gql`
        query {
          requiredString
        }
      `,
    })
    return { message: requiredString }
  }
}

describe('BaseGraphqlService', function () {
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
      await DummyGraphqlService.invoke(
        { requestFetcher },
        { handleInternalErrors: false }
      )

      expect(requestFetcher).to.have.been.calledOnceWith(
        'http://example.com/graphql',
        {
          body: '{"query":"{\\n  requiredString\\n}\\n","variables":{}}',
          headers: { Accept: 'application/json' },
          method: 'POST',
        }
      )
    })

    it('forwards options to _requestFetcher', async function () {
      class WithOptions extends DummyGraphqlService {
        async handle() {
          const { value } = await this._requestGraphql({
            schema: dummySchema,
            url: 'http://example.com/graphql',
            query: gql`
              query {
                requiredString
              }
            `,
            options: { searchParams: { queryParam: 123 } },
          })
          return { message: value }
        }
      }

      await WithOptions.invoke(
        { requestFetcher },
        { handleInternalErrors: false }
      )

      expect(requestFetcher).to.have.been.calledOnceWith(
        'http://example.com/graphql',
        {
          body: '{"query":"{\\n  requiredString\\n}\\n","variables":{}}',
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
        await DummyGraphqlService.invoke(
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
        await DummyGraphqlService.invoke(
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
        await DummyGraphqlService.invoke(
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

  describe('Error handling', function () {
    it('handles generic error', async function () {
      const requestFetcher = async () => ({
        buffer: '{ "errors": [ { "message": "oh noes!!" } ] }',
        res: { statusCode: 200 },
      })
      expect(
        await DummyGraphqlService.invoke(
          { requestFetcher },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'oh noes!!',
      })
    })

    it('handles custom error', async function () {
      class WithErrorHandler extends DummyGraphqlService {
        async handle() {
          const { requiredString } = await this._requestGraphql({
            schema: dummySchema,
            url: 'http://example.com/graphql',
            query: gql`
              query {
                requiredString
              }
            `,
            transformErrors: function (errors) {
              if (errors[0].message === 'oh noes!!') {
                return new InvalidResponse({
                  prettyMessage: 'a terrible thing has happened',
                })
              }
            },
          })
          return { message: requiredString }
        }
      }

      const requestFetcher = async () => ({
        buffer: '{ "errors": [ { "message": "oh noes!!" } ] }',
        res: { statusCode: 200 },
      })
      expect(
        await WithErrorHandler.invoke(
          { requestFetcher },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'a terrible thing has happened',
      })
    })
  })
})
