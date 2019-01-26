'use strict'

const { URL } = require('url')
const Joi = require('joi')
const { errorMessages } = require('../dynamic/dynamic-helpers')
const { BaseJsonService, InvalidParameter } = require('..')
const { optionalUrl } = require('../validators')

const blockedDomains = ['github.com', 'shields.io']

const queryParamSchema = Joi.object({
  url: optionalUrl.required(),
}).required()

const anySchema = Joi.any()

const optionalStringWhenNamedLogoPresent = Joi.alternatives().when(
  'namedLogo',
  {
    is: Joi.string().required(),
    then: Joi.string(),
  }
)

const optionalNumberWhenAnyLogoPresent = Joi.alternatives()
  .when('namedLogo', { is: Joi.string().required(), then: Joi.number() })
  .when('logoSvg', { is: Joi.string().required(), then: Joi.number() })

const endpointSchema = Joi.object({
  schemaVersion: 1,
  label: Joi.string()
    .allow('')
    .required(),
  message: Joi.string().required(),
  color: Joi.string(),
  labelColor: Joi.string(),
  isError: Joi.boolean().default(false),
  namedLogo: Joi.string(),
  logoSvg: Joi.string(),
  logoColor: optionalStringWhenNamedLogoPresent,
  logoWidth: optionalNumberWhenAnyLogoPresent,
  logoPosition: optionalNumberWhenAnyLogoPresent,
  style: Joi.string(),
  cacheSeconds: Joi.number()
    .integer()
    .min(0),
})
  // `namedLogo` or `logoSvg`; not both.
  .oxor('namedLogo', 'logoSvg')
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
      namedLogo,
      logoSvg,
      logoColor,
      logoWidth,
      logoPosition,
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

    const json = await this._requestJson({
      schema: anySchema,
      url,
      errorMessages,
    })
    // Override the validation options because we want to reject unknown keys.
    const validated = this.constructor._validate(json, endpointSchema, {
      prettyErrorMessage: 'invalid properties',
      includeKeys: true,
      allowAndStripUnknownKeys: false,
    })

    return this.constructor.render(validated)
  }
}
