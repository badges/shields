'use strict'

const { expect } = require('chai')
const sinon = require('sinon')
const Joi = require('@hapi/joi')
const makeBadge = require('../../gh-badges/lib/make-badge')
const BaseSvgScrapingService = require('./base-svg-scraping')

function makeExampleSvg({ label, message }) {
  return makeBadge({ text: ['this is the label', 'this is the result!'] })
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
    let sendAndCacheRequest
    beforeEach(function() {
      sendAndCacheRequest = sinon.stub().returns(
        Promise.resolve({
          buffer: exampleSvg,
          res: { statusCode: 200 },
        })
      )
    })

    it('invokes _sendAndCacheRequest with the expected header', async function() {
      await DummySvgScrapingService.invoke(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )

      expect(sendAndCacheRequest).to.have.been.calledOnceWith(
        'http://example.com/foo.svg',
        {
          headers: { Accept: 'image/svg+xml' },
        }
      )
    })

    it('forwards options to _sendAndCacheRequest', async function() {
      class WithCustomOptions extends DummySvgScrapingService {
        async handle() {
          const { message } = await this._requestSvg({
            schema,
            url: 'http://example.com/foo.svg',
            options: {
              method: 'POST',
              qs: { queryParam: 123 },
            },
          })
          return { message }
        }
      }

      await WithCustomOptions.invoke(
        { sendAndCacheRequest },
        { handleInternalErrors: false }
      )

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
      expect(
        await DummySvgScrapingService.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        message: exampleMessage,
      })
    })

    it('allows overriding the valueMatcher', async function() {
      class WithValueMatcher extends BaseSvgScrapingService {
        static get route() {
          return {}
        }

        async handle() {
          return this._requestSvg({
            schema,
            valueMatcher: />([^<>]+)<\/desc>/,
            url: 'http://example.com/foo.svg',
          })
        }
      }
      const sendAndCacheRequest = async () => ({
        buffer: '<desc>a different message</desc>',
        res: { statusCode: 200 },
      })
      expect(
        await WithValueMatcher.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        message: 'a different message',
      })
    })

    it('handles unparseable svg responses', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: 'not svg yo',
        res: { statusCode: 200 },
      })
      expect(
        await DummySvgScrapingService.invoke(
          { sendAndCacheRequest },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        message: 'unparseable svg response',
      })
    })
  })
})
