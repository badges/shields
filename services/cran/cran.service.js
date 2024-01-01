import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

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

  static openApi = {
    '/cran/l/{packageName}': {
      get: {
        summary: 'CRAN/METACRAN License',
        parameters: pathParams({
          name: 'packageName',
          example: 'devtools',
        }),
      },
    },
  }

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

  static openApi = {
    '/cran/v/{packageName}': {
      get: {
        summary: 'CRAN/METACRAN Version',
        parameters: pathParams({
          name: 'packageName',
          example: 'devtools',
        }),
      },
    },
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return this.constructor.render({ version: data.Version })
  }
}

export { CranLicense, CranVersion }
