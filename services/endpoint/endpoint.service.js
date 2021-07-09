import { URL } from 'url'
import Joi from 'joi'
import { errorMessages } from '../dynamic-common.js'
import { optionalUrl } from '../validators.js'
import { fetchEndpointData } from '../endpoint-common.js'
import { BaseJsonService, InvalidParameter } from '../index.js'

const blockedDomains = ['github.com', 'shields.io']

const queryParamSchema = Joi.object({
  url: optionalUrl.required(),
}).required()

export default class Endpoint extends BaseJsonService {
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
    let protocol, hostname
    try {
      const parsedUrl = new URL(url)
      protocol = parsedUrl.protocol
      hostname = parsedUrl.hostname
    } catch (e) {
      throw new InvalidParameter({ prettyMessage: 'invalid url' })
    }
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
