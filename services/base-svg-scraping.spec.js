'use strict'

const { expect } = require('chai')
const sinon = require('sinon')
const Joi = require('joi')
const { makeBadgeData } = require('../lib/badge-data')
const makeBadge = require('../gh-badges/lib/make-badge')
const BaseSvgScrapingService = require('./base-svg-scraping')

function makeExampleSvg({ label, message }) {
  const badgeData = makeBadgeData('this is the label', {})
  badgeData.text[1] = 'this is the result!'
  return makeBadge(badgeData)
}

const schema = Joi.object({
  message: Joi.string().required(),
}).required()

class DummySvgScrapingService extends BaseSvgScrapingService {
  static get category() {
    return 'cat'
  }

  static get route() {
    return {
      base: 'foo',
    }
  }

  async handle() {
    return this._requestSvg({
      schema,
      url: 'http://example.com/foo.svg',
    })
  }
}

describe('BaseSvgScrapingService', function() {
  const exampleLabel = 'this is the label'
  const exampleMessage = 'this is the result!'
  const exampleSvg = makeExampleSvg({
    label: exampleLabel,
    message: exampleMessage,
  })

  describe('valueFromSvgBadge', function() {
    it('should find the correct value', function() {
      expect(BaseSvgScrapingService.valueFromSvgBadge(exampleSvg)).to.equal(
        exampleMessage
      )
    })
  })

  describe('Making requests', function() {
    let sendAndCacheRequest, serviceInstance
    beforeEach(function() {
      sendAndCacheRequest = sinon.stub().returns(
        Promise.resolve({
          buffer: exampleSvg,
          res: { statusCode: 200 },
        })
      )
      serviceInstance = new DummySvgScrapingService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
    })

    it('invokes _sendAndCacheRequest with the expected header', async function() {
      await serviceInstance.invokeHandler({}, {})

      expect(sendAndCacheRequest).to.have.been.calledOnceWith(
        'http://example.com/foo.svg',
        {
          headers: { Accept: 'image/svg+xml' },
        }
      )
    })

    it('forwards options to _sendAndCacheRequest', async function() {
      Object.assign(serviceInstance, {
        async handle() {
          const { value } = await this._requestSvg({
            schema,
            url: 'http://example.com/foo.svg',
            options: {
              method: 'POST',
              qs: { queryParam: 123 },
            },
          })
          return { message: value }
        },
      })

      await serviceInstance.invokeHandler({}, {})

      expect(sendAndCacheRequest).to.have.been.calledOnceWith(
        'http://example.com/foo.svg',
        {
          method: 'POST',
          headers: { Accept: 'image/svg+xml' },
          qs: { queryParam: 123 },
        }
      )
    })
  })

  describe('Making badges', function() {
    it('handles valid svg responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: exampleSvg,
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummySvgScrapingService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
      const serviceData = await serviceInstance.invokeHandler({}, {})
      expect(serviceData).to.deep.equal({
        message: exampleMessage,
      })
    })

    it('allows overriding the valueMatcher', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: '<desc>a different message</desc>',
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummySvgScrapingService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
      Object.assign(serviceInstance, {
        async handle() {
          return this._requestSvg({
            schema,
            valueMatcher: />([^<>]+)<\/desc>/,
            url: 'http://example.com/foo.svg',
          })
        },
      })
      const serviceData = await serviceInstance.invokeHandler({}, {})
      expect(serviceData).to.deep.equal({
        message: 'a different message',
      })
    })

    it('handles unparseable svg responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: 'not svg yo',
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummySvgScrapingService(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )
      const serviceData = await serviceInstance.invokeHandler({}, {})
      expect(serviceData).to.deep.equal({
        color: 'lightgray',
        message: 'unparseable svg response',
      })
    })
  })
})
