'use strict'

const camelcase = require('camelcase')
const emojic = require('emojic')
const Joi = require('joi')
const { isValidCategory } = require('../../services/categories')
const BaseService = require('./base')
const {
  serverHasBeenUpSinceResourceCached,
  setCacheHeadersForStaticResource,
} = require('./cache-headers')
const { isValidRoute, prepareRoute, namedParamsForMatch } = require('./route')
const trace = require('./trace')

const attrSchema = Joi.object({
  category: isValidCategory,
  route: isValidRoute,
  target: Joi.func()
    .maxArity(1)
    .required()
    .error(
      () =>
        '"target" must be a function that transforms named params to a new path'
    ),
  dateAdded: Joi.date().required(),
}).required()

module.exports = function redirector(attrs) {
  const { category, route, target } = Joi.attempt(
    attrs,
    attrSchema,
    `Redirector for ${attrs.route.base}`
  )

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

    static get name() {
      return `${camelcase(route.base, { pascalCase: true })}Redirector`
    }

    static get _description() {
      return `${route.base} redirector`
    }

    static get _prometheusMetricName() {
      return `service_redirect_${route.base.replace(/\//g, '_')}_requests_total`
    }

    static register({ camp }, { prometheusMetricsEnabled }) {
      const { regex, captureNames } = prepareRoute(this.route)

      const prometheusCounter = prometheusMetricsEnabled
        ? this._createPrometheusCounter()
        : undefined

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

        if (prometheusCounter) {
          prometheusCounter.inc()
        }
      })
    }
  }
}
