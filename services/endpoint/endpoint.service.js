'use strict'

const { URL } = require('url')
const Joi = require('joi')
const { errorMessages } = require('../dynamic-common')
const { optionalUrl } = require('../validators')
const { fetchEndpointData } = require('../endpoint-common')
const { BaseJsonService, InvalidParameter } = require('..')

const blockedDomains = ['github.com', 'shields.io']

const queryParamSchema = Joi.object({
  url: optionalUrl.required(),
}).required()

module.exports = class Endpoint extends BaseJsonService {
  static category = 'dynamic'
  static route = {
    base: 'endpoint',
    pattern: '',
    queryParamSchema,
  }

  static _cacheLength = 300
  static defaultBadgeData = { label: 'custom badge' }

  static render({
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

  async handle(namedParams, { url }) {
    const { protocol, hostname } = new URL(url)
    if (protocol !== 'https:') {
      throw new InvalidParameter({ prettyMessage: 'please use https' })
    }
    if (blockedDomains.some(domain => hostname.endsWith(domain))) {
      throw new InvalidParameter({ prettyMessage: 'domain is blocked' })
    }

    const validated = await fetchEndpointData(this, {
      url,
      errorMessages,
      validationPrettyErrorMessage: 'invalid properties',
      includeKeys: true,
    })

    return this.constructor.render(validated)
  }
}
