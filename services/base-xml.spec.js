'use strict'

const Joi = require('joi')
const chai = require('chai')
const { expect } = chai

const BaseXmlService = require('./base-xml')

chai.use(require('chai-as-promised'))

const dummySchema = Joi.object({
  requiredString: Joi.string().required(),
}).required()

class DummyXmlService extends BaseXmlService {
  static get category() {
    return 'cat'
  }

  static get url() {
    return {
      base: 'foo',
    }
  }

  async handle() {
    const { requiredString } = await this._requestXml({ schema: dummySchema })
    return { message: requiredString }
  }
}

describe('BaseXmlService', function() {
  it('handles xml responses', async function() {
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
