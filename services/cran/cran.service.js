import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  License: Joi.string().required(),
  Version: Joi.string().required(),
}).required()

class BaseCranService extends BaseJsonService {
  static defaultBadgeData = { label: 'cran' }

  async fetch({ packageName }) {
    const url = `http://crandb.r-pkg.org/${packageName}`
    return this._requestJson({ schema, url })
  }
}

class CranLicense extends BaseCranService {
  static category = 'license'
  static route = { base: 'cran/l', pattern: ':packageName' }

  static examples = [
    {
      title: 'CRAN/METACRAN',
      namedParams: { packageName: 'devtools' },
      staticPreview: this.render({ license: 'MIT + file LICENSE' }),
    },
  ]

  static render({ license }) {
    return {
      label: 'license',
      message: license,
      color: 'blue',
    }
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return this.constructor.render({ license: data.License })
  }
}

class CranVersion extends BaseCranService {
  static category = 'version'
  static route = { base: 'cran/v', pattern: ':packageName' }

  static examples = [
    {
      title: 'CRAN/METACRAN',
      namedParams: { packageName: 'devtools' },
      staticPreview: this.render({ version: '2.0.1' }),
    },
  ]

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return this.constructor.render({ version: data.Version })
  }
}

export { CranLicense, CranVersion }
