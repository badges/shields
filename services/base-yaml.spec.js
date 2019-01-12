'use strict'

const Joi = require('joi')
const { expect } = require('chai')
const sinon = require('sinon')
const BaseYamlService = require('./base-yaml')

const dummySchema = Joi.object({
  requiredString: Joi.string().required(),
}).required()

class DummyYamlService extends BaseYamlService {
  static get category() {
    return 'cat'
  }

  static get route() {
    return {
      base: 'foo',
    }
  }

  async handle() {
    const { requiredString } = await this._requestYaml({
      schema: dummySchema,
      url: 'http://example.com/foo.yaml',
    })
    return { message: requiredString }
  }
}

const expectedYaml = `
---
requiredString: some-string
`

const unexpectedYaml = `
---
unexpectedKey: some-string
`

const invalidYaml = `
---
foo: bar
foo: baz
`

describe('BaseYamlService', function() {
  describe('Making requests', function() {
    let sendAndCacheRequest
    beforeEach(function() {
      sendAndCacheRequest = sinon.stub().returns(
        Promise.resolve({
          buffer: expectedYaml,
          res: { statusCode: 200 },
        })
      )
    })

    it('invokes _sendAndCacheRequest', async function() {
      await DummyYamlService.invoke(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )

      expect(sendAndCacheRequest).to.have.been.calledOnceWith(
        'http://example.com/foo.yaml',
        {
          headers: {
            Accept:
              'text/x-yaml, text/yaml, application/x-yaml, application/yaml, text/plain',
          },
        }
      )
    })

    it('forwards options to _sendAndCacheRequest', async function() {
      class WithOptions extends DummyYamlService {
        async handle() {
          const { value } = await this._requestYaml({
            schema: dummySchema,
            url: 'http://example.com/foo.yaml',
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
        'http://example.com/foo.yaml',
        {
          headers: {
            Accept:
              'text/x-yaml, text/yaml, application/x-yaml, application/yaml, text/plain',
          },
          method: 'POST',
          qs: { queryParam: 123 },
        }
      )
    })
  })

  describe('Making badges', function() {
    it('handles valid yaml responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: expectedYaml,
        res: { statusCode: 200 },
      })
      expect(
        await DummyYamlService.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        message: 'some-string',
      })
    })

    it('handles yaml responses which do not match the schema', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: unexpectedYaml,
        res: { statusCode: 200 },
      })
      expect(
        await DummyYamlService.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'invalid response data',
      })
    })

    it('handles unparseable yaml responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: invalidYaml,
        res: { statusCode: 200 },
      })
      expect(
        await DummyYamlService.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'unparseable yaml response',
      })
    })
  })
})
