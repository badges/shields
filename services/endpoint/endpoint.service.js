'use strict'

const { URL } = require('url')
const Joi = require('joi')
const { errorMessages } = require('../dynamic/dynamic-helpers')
const BaseJsonService = require('../base-json')
const { InvalidParameter } = require('../errors')
const { optionalUrl } = require('../validators')

const blockedDomains = ['github.com', 'shields.io']

const queryParamSchema = Joi.object({
  url: optionalUrl.required(),
}).required()

const endpointSchema = Joi.object({
  schemaVersion: 1,
  label: Joi.string()
    .allow('')
    .required(),
  message: Joi.string().required(),
  color: Joi.string(),
  labelColor: Joi.string(),
  isError: Joi.boolean().default(false),
  link: Joi.string(),
  namedLogo: Joi.string(),
  logoSvg: Joi.string(),
  logoColor: Joi.forbidden(),
  logoWidth: Joi.forbidden(),
  logoPosition: Joi.forbidden(),
  style: Joi.string(),
  cacheSeconds: Joi.number()
    .integer()
    .min(0),
})
  .oxor('namedLogo', 'logoSvg')
  .when(
    Joi.alternatives().try(
      Joi.object({ namedLogo: Joi.string().required() }).unknown(),
      Joi.object({ logoSvg: Joi.string().required() }).unknown()
    ),
    {
      then: Joi.object({
        logoColor: Joi.string(),
        logoWidth: Joi.number(),
        logoPosition: Joi.number(),
      }),
    }
  )
  .required()

module.exports = class Endpoint extends BaseJsonService {
  static get category() {
    return 'dynamic'
  }

  static get route() {
    return {
      base: 'badge/endpoint',
      pattern: '',
      queryParams: ['url'],
    }
  }

  static get _cacheLength() {
    return 300
  }

  static get defaultBadgeData() {
    return {
      label: 'custom badge',
    }
  }

  static render({
    label,
    message,
    color,
    labelColor,
    namedLogo,
    logoSvg,
    logoColor,
    logoWidth,
    logoPosition,
    style,
    isError,
    cacheSeconds,
  }) {
    return {
      isError,
      label,
      message,
      color,
      labelColor,
      style,
      cacheSeconds,
    }
  }

  async handle(namedParams, queryParams) {
    const { url } = this.constructor._validateQueryParams(
      queryParams,
      queryParamSchema
    )

    const { protocol, hostname } = new URL(url)
    if (protocol !== 'https:') {
      throw new InvalidParameter({ prettyMessage: 'please use https' })
    }
    if (blockedDomains.some(domain => hostname.endsWith(domain))) {
      throw new InvalidParameter({ prettyMessage: 'domain is blocked' })
    }

    const data = await this._requestJson({
      schema: endpointSchema,
      url,
      errorMessages,
    })

    return this.constructor.render(data)
  }
}
