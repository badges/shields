'use strict'

const emojic = require('emojic')
const Joi = require('joi')
const BaseService = require('./base')
const {
  serverHasBeenUpSinceResourceCached,
  setCacheHeadersForStaticResource,
} = require('./cache-headers')
const { prepareRoute, namedParamsForMatch } = require('./route')
const trace = require('./trace')

module.exports = function redirector({ category, route, target, dateAdded }) {
  return class Redirector extends BaseService {
    static get category() {
      return category
    }

    static get route() {
      return route
    }

    static get isDeprecated() {
      return true
    }

    static validateDefinition() {
      super.validateDefinition()
      Joi.assert(
        { dateAdded },
        Joi.object({
          dateAdded: Joi.date().required(),
        }),
        `Redirector for ${route.base}`
      )
    }

    static register({ camp }) {
      const { regex, captureNames } = prepareRoute(this.route)

      camp.route(regex, async (queryParams, match, end, ask) => {
        if (serverHasBeenUpSinceResourceCached(ask.req)) {
          // Send Not Modified.
          ask.res.statusCode = 304
          ask.res.end()
          return
        }

        const namedParams = namedParamsForMatch(captureNames, match, this)
        trace.logTrace(
          'inbound',
          emojic.arrowHeadingUp,
          'Redirector',
          route.base
        )
        trace.logTrace('inbound', emojic.ticket, 'Named params', namedParams)
        trace.logTrace('inbound', emojic.crayon, 'Query params', queryParams)

        const targetUrl = target(namedParams)
        trace.logTrace('validate', emojic.dart, 'Target', targetUrl)

        // The final capture group is the extension.
        const format = match.slice(-1)[0]
        const redirectUrl = `${targetUrl}.${format}${ask.uri.search || ''}`
        trace.logTrace('outbound', emojic.shield, 'Redirect URL', redirectUrl)

        ask.res.statusCode = 301
        ask.res.setHeader('Location', redirectUrl)

        // To avoid caching mistakes for a long time, and to make this simpler
        // to reason about, use the same cache semantics as the static badge.
        setCacheHeadersForStaticResource(ask.res)

        ask.res.end()
      })
    }
  }
}
