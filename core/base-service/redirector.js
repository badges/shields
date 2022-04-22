import url from 'url'
import camelcase from 'camelcase'
import emojic from 'emojic'
import Joi from 'joi'
import queryString from 'query-string'
import BaseService from './base.js'
import {
  serverHasBeenUpSinceResourceCached,
  setCacheHeadersForStaticResource,
} from './cache-headers.js'
import { isValidCategory } from './categories.js'
import { MetricHelper } from './metric-helper.js'
import { isValidRoute, prepareRoute, paramsForReq } from './route.js'
import trace from './trace.js'

const attrSchema = Joi.object({
  name: Joi.string().min(3),
  category: isValidCategory,
  isDeprecated: Joi.boolean().default(true),
  route: isValidRoute,
  examples: Joi.array().has(Joi.object()).default([]),
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

export default function redirector(attrs) {
  const {
    name,
    category,
    isDeprecated,
    route,
    examples,
    transformPath,
    transformQueryParams,
    overrideTransformedQueryParams,
  } = Joi.attempt(attrs, attrSchema, `Redirector for ${attrs.route.base}`)

  return class Redirector extends BaseService {
    static name =
      name ||
      `${camelcase(route.base.replace(/\//g, '_'), {
        pascalCase: true,
      })}Redirect`

    static category = category
    static isDeprecated = isDeprecated
    static route = route
    static examples = examples

    static register({ app, metricInstance }, { rasterUrl }) {
      const ServiceClass = this // eslint-disable-line @typescript-eslint/no-this-alias

      const { regex, captureNames } = prepareRoute({
        ...this.route,
        withPng: Boolean(rasterUrl),
      })

      const metricHelper = MetricHelper.create({
        metricInstance,
        ServiceClass: this,
      })

      app.get(regex, async function (req, res) {
        if (serverHasBeenUpSinceResourceCached(req)) {
          // Send Not Modified.
          res.status(304)
          res.end()
          return
        }

        const metricHandle = metricHelper.startRequest()

        const { namedParams, format } = paramsForReq(
          captureNames,
          req,
          ServiceClass
        )
        trace.logTrace(
          'inbound',
          emojic.arrowHeadingUp,
          'Redirector',
          route.base
        )
        trace.logTrace('inbound', emojic.ticket, 'Named params', namedParams)
        trace.logTrace('inbound', emojic.crayon, 'Query params', req.query)

        const targetPath = encodeURI(transformPath(namedParams))
        trace.logTrace('validate', emojic.dart, 'Target', targetPath)

        let urlSuffix = url.parse(req.url).search ?? '' // eslint-disable-line node/no-deprecated-api

        if (transformQueryParams) {
          const specifiedParams = queryString.parse(urlSuffix)
          const transformedParams = transformQueryParams(namedParams)
          const redirectParams = overrideTransformedQueryParams
            ? Object.assign(transformedParams, specifiedParams)
            : Object.assign(specifiedParams, transformedParams)
          const outQueryString = queryString.stringify(redirectParams)
          urlSuffix = `?${outQueryString}`
        }

        const baseUrl = format === 'png' ? rasterUrl : ''
        const redirectUrl = `${baseUrl}${targetPath}.${format}${urlSuffix}`
        trace.logTrace('outbound', emojic.shield, 'Redirect URL', redirectUrl)

        res.status(301)
        res.setHeader('Location', redirectUrl)

        // To avoid caching mistakes for a long time, and to make this simpler
        // to reason about, use the same cache semantics as the static badge.
        setCacheHeadersForStaticResource(res)

        res.end()

        metricHandle.noteResponseSent()
      })
    }
  }
}
