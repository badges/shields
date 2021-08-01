import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  license: Joi.array().items(Joi.string()).single(),
  version: Joi.object({
    number: Joi.string().required(),
  }).required(),
}).required()

class BaseCtanService extends BaseJsonService {
  static defaultBadgeData = { label: 'ctan' }

  async fetch({ library }) {
    const url = `http://www.ctan.org/json/pkg/${library}`
    return this._requestJson({
      schema,
      url,
    })
  }
}

class CtanLicense extends BaseCtanService {
  static category = 'license'
  static route = { base: 'ctan/l', pattern: ':library' }

  static examples = [
    {
      title: 'CTAN',
      namedParams: { library: 'novel' },
      staticPreview: this.render({ licenses: ['ppl1.3c', 'ofl'] }),
      keywords: ['tex'],
    },
  ]

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

  static examples = [
    {
      title: 'CTAN',
      namedParams: { library: 'tex' },
      staticPreview: this.render({ version: '3.14159265' }),
      keywords: ['tex'],
    },
  ]

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ library }) {
    const json = await this.fetch({ library })
    return renderVersionBadge({ version: json.version.number })
  }
}

export { CtanLicense, CtanVersion }
