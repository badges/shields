import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, InvalidResponse, pathParams } from '../index.js'

const schema = Joi.object({
  license: Joi.array().items(Joi.string()).single(),
  version: Joi.object({
    number: Joi.string().allow('').required(),
    date: Joi.string().allow('').required(),
  }).required(),
}).required()

const description = '[CTAN](https://ctan.org/) is a package registry for TeX.'

class BaseCtanService extends BaseJsonService {
  static defaultBadgeData = { label: 'ctan' }

  async fetch({ library }) {
    const url = `https://www.ctan.org/json/2.0/pkg/${library}`
    return this._requestJson({
      schema,
      url,
    })
  }
}

class CtanLicense extends BaseCtanService {
  static category = 'license'
  static route = { base: 'ctan/l', pattern: ':library' }

  static openApi = {
    '/ctan/l/{library}': {
      get: {
        summary: 'CTAN License',
        description,
        parameters: pathParams({
          name: 'library',
          example: 'novel',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'license' }

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle({ library }) {
    const json = await this.fetch({ library })
    // when present, API returns licenses inconsistently ordered, so fix the order
    return renderLicenseBadge({ licenses: json.license && json.license.sort() })
  }
}

class CtanVersion extends BaseCtanService {
  static category = 'version'
  static route = { base: 'ctan/v', pattern: ':library' }

  static openApi = {
    '/ctan/v/{library}': {
      get: {
        summary: 'CTAN Version',
        description,
        parameters: pathParams({
          name: 'library',
          example: 'tex',
        }),
      },
    },
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ library }) {
    const json = await this.fetch({ library })
    const version = json.version.number
    if (version !== '') {
      return renderVersionBadge({ version })
    } else {
      const date = json.version.date
      if (date !== '') {
        return renderVersionBadge({
          version: date,
          versionFormatter: color => 'blue',
        })
      } else {
        return new InvalidResponse({
          underlyingError: new Error('Both number and date are empty'),
        })
      }
    }
  }
}

export { CtanLicense, CtanVersion }
