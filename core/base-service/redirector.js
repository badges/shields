'use strict'

const camelcase = require('camelcase')
const emojic = require('emojic')
const Joi = require('@hapi/joi')
const queryString = require('query-string')
const BaseService = require('./base')
const {
  serverHasBeenUpSinceResourceCached,
  setCacheHeadersForStaticResource,
} = require('./cache-headers')
const { isValidCategory } = require('./categories')
const { isValidRoute, prepareRoute, namedParamsForMatch } = require('./route')
const trace = require('./trace')

const attrSchema = Joi.object({
  name: Joi.string().min(3),
  category: isValidCategory,
  route: isValidRoute,
  transformPath: Joi.func()
    .maxArity(1)
    .required()
    .error(
      () =>
        '"transformPath" must be a function that transforms named params to a new path'
    ),
  transformQueryParams: Joi.func().arity(1),
  dateAdded: Joi.date().required(),
  overrideTransformedQueryParams: Joi.bool().optional(),
}).required()

module.exports = function redirector(attrs) {
  const {
    name,
    category,
    route,
    transformPath,
    transformQueryParams,
    overrideTransformedQueryParams,
  } = Joi.attempt(attrs, attrSchema, `Redirector for ${attrs.route.base}`)

  return class Redirector extends BaseService {
    static get name() {
      if (name) {
        return name
      } else {
        return `${camelcase(route.base.replace(/\//g, '_'), {
          pascalCase: true,
        })}Redirect`
      }
    }

    static get category() {
      return category
    }

    static get isDeprecated() {
      return true
    }

    static get route() {
      return route
    }

    static register({ camp, requestCounter }, { rasterUrl }) {
      const { regex, captureNames } = prepareRoute({
        ...this.route,
        withPng: Boolean(rasterUrl),
      })

      const serviceRequestCounter = this._createServiceRequestCounter({
        requestCounter,
      })

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

        const targetPath = transformPath(namedParams)
        trace.logTrace('validate', emojic.dart, 'Target', targetPath)

        let urlSuffix = ask.uri.search || ''

        if (transformQueryParams) {
          const specifiedParams = queryString.parse(urlSuffix)
          const transformedParams = transformQueryParams(namedParams)
          const redirectParams = overrideTransformedQueryParams
            ? Object.assign(transformedParams, specifiedParams)
            : Object.assign(specifiedParams, transformedParams)
          const outQueryString = queryString.stringify(redirectParams)
          urlSuffix = `?${outQueryString}`
        }

        // The final capture group is the extension.
        const format = (match.slice(-1)[0] || '.svg').replace(/^\./, '')
        const redirectUrl = `${
          format === 'png' ? rasterUrl : ''
        }${targetPath}.${format}${urlSuffix}`
        trace.logTrace('outbound', emojic.shield, 'Redirect URL', redirectUrl)

        ask.res.statusCode = 301
        ask.res.setHeader('Location', redirectUrl)

        // To avoid caching mistakes for a long time, and to make this simpler
        // to reason about, use the same cache semantics as the static badge.
        setCacheHeadersForStaticResource(ask.res)

        ask.res.end()

        serviceRequestCounter.inc()
      })
    }
  }
}
