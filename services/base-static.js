'use strict'

const makeBadge = require('../gh-badges/lib/make-badge')
const { makeSend } = require('../lib/result-sender')
const analytics = require('../lib/analytics')
const BaseService = require('./base')

const serverStartTime = new Date(new Date().toGMTString())

module.exports = class BaseStaticService extends BaseService {
  // Note: Since this is a static service, it is not `async`.
  handle(namedParams, queryParams) {
    throw new Error(`Handler not implemented for ${this.constructor.name}`)
  }

  static register({ camp }, serviceConfig) {
    camp.route(this._regex, (queryParams, match, end, ask) => {
      analytics.noteRequest(queryParams, match)

      if (+new Date(ask.req.headers['if-modified-since']) >= +serverStartTime) {
        // Send Not Modified.
        ask.res.statusCode = 304
        ask.res.end()
        return
      }

      const serviceInstance = new this({}, serviceConfig)
      const namedParams = this._namedParamsForMatch(match)
      let serviceData
      try {
        // Note: no `await`.
        serviceData = serviceInstance.handle(namedParams, queryParams)
      } catch (error) {
        serviceData = serviceInstance._handleError(error)
      }

      const badgeData = this._makeBadgeData(queryParams, serviceData)

      // The final capture group is the extension.
      const format = match.slice(-1)[0]
      badgeData.format = format

      if (serviceConfig.profiling.makeBadge) {
        console.time('makeBadge total')
      }
      const svg = makeBadge(badgeData)
      if (serviceConfig.profiling.makeBadge) {
        console.timeEnd('makeBadge total')
      }

      const cacheDuration = 3600 * 24 * 1 // 1 day.
      ask.res.setHeader('Cache-Control', `max-age=${cacheDuration}`)
      ask.res.setHeader('Last-Modified', serverStartTime.toGMTString())

      makeSend(format, ask.res, end)(svg)
    })
  }
}
