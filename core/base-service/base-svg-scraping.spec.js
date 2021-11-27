import { expect } from 'chai'
import sinon from 'sinon'
import Joi from 'joi'
import makeBadge from '../../badge-maker/lib/make-badge.js'
import BaseSvgScrapingService from './base-svg-scraping.js'

const schema = Joi.object({
  message: Joi.string().required(),
}).required()

class DummySvgScrapingService extends BaseSvgScrapingService {
  static category = 'cat'
  static route = { base: 'foo' }

  async handle() {
    return this._requestSvg({
      schema,
      url: 'http://example.com/foo.svg',
    })
  }
}

describe('BaseSvgScrapingService', function () {
  const exampleLabel = 'this is the label'
  const exampleMessage = 'this is the result!'
  const exampleSvg = makeBadge({ label: exampleLabel, message: exampleMessage })

  describe('valueFromSvgBadge', function () {
    it('should find the correct value', function () {
      expect(BaseSvgScrapingService.valueFromSvgBadge(exampleSvg)).to.equal(
        exampleMessage
      )
    })
  })

  describe('Making requests', function () {
    let requestFetcher
    beforeEach(function () {
      requestFetcher = sinon.stub().returns(
        Promise.resolve({
          buffer: exampleSvg,
          res: { statusCode: 200 },
        })
      )
    })

    it('invokes _requestFetcher with the expected header', async function () {
      await DummySvgScrapingService.invoke(
        { requestFetcher },
        { handleInternalErrors: false }
      )

      expect(requestFetcher).to.have.been.calledOnceWith(
        'http://example.com/foo.svg',
        {
          headers: { Accept: 'image/svg+xml' },
        }
      )
    })

    it('forwards options to _requestFetcher', async function () {
      class WithCustomOptions extends DummySvgScrapingService {
        async handle() {
          const { message } = await this._requestSvg({
            schema,
            url: 'http://example.com/foo.svg',
            options: {
              method: 'POST',
              searchParams: { queryParam: 123 },
            },
          })
          return { message }
        }
      }

      await WithCustomOptions.invoke(
        { requestFetcher },
        { handleInternalErrors: false }
      )

      expect(requestFetcher).to.have.been.calledOnceWith(
        'http://example.com/foo.svg',
        {
          method: 'POST',
          headers: { Accept: 'image/svg+xml' },
          searchParams: { queryParam: 123 },
        }
      )
    })
  })

  describe('Making badges', function () {
    it('handles valid svg responses', async function () {
      const requestFetcher = async () => ({
        buffer: exampleSvg,
        res: { statusCode: 200 },
      })
      expect(
        await DummySvgScrapingService.invoke(
          { requestFetcher },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        message: exampleMessage,
      })
    })

    it('allows overriding the valueMatcher', async function () {
      class WithValueMatcher extends BaseSvgScrapingService {
        static route = {}

        async handle() {
          return this._requestSvg({
            schema,
            valueMatcher: />([^<>]+)<\/desc>/,
            url: 'http://example.com/foo.svg',
          })
        }
      }
      const requestFetcher = async () => ({
        buffer: '<desc>a different message</desc>',
        res: { statusCode: 200 },
      })
      expect(
        await WithValueMatcher.invoke(
          { requestFetcher },
          { handleInternalErrors: false }
        )
      ).to.deep.equal({
        message: 'a different message',
      })
    })

    it('handles unparseable svg responses', async function () {
      const requestFetcher = async () => ({
        buffer: 'not svg yo',
        res: { statusCode: 200 },
      })
      expect(
        await DummySvgScrapingService.invoke(
          { requestFetcher },
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
