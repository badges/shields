'use strict'

const Joi = require('joi')
const chai = require('chai')
const { expect } = chai

const BaseJsonService = require('./base-json')
const { invalidJSON } = require('./response-fixtures')

chai.use(require('chai-as-promised'))

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
    const { value } = await this._requestJson({ schema: Joi.any() })
    return { message: value }
  }
}

describe('BaseJsonService', () => {
  it('handles unparseable json responses', async function() {
    const sendAndCacheRequest = async () => ({
      buffer: invalidJSON,
      res: { statusCode: 200 },
    })
    const serviceInstance = new DummyJsonService(
      { sendAndCacheRequest },
      { handleInternalErrors: false }
    )
    const serviceData = await serviceInstance.invokeHandler(
      { schema: Joi.any() },
      {}
    )
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
})
