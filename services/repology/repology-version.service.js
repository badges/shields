import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseSvgScrapingService, pathParams } from '../index.js'

const schema = Joi.object({
  message: Joi.string().required(),
}).required()

export default class RepologyVersion extends BaseSvgScrapingService {
  static category = 'version'

  static route = {
    base: 'repology/version',
    pattern: ':projectName',
  }

  static openApi = {
    '/repology/version/{projectName}': {
      get: {
        summary: 'Repology - Latest Version',
        parameters: pathParams({
          name: 'projectName',
          example: 'starship',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'repology',
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ projectName }) {
    const { message: version } = await this._requestSvg({
      schema,
      url: `https://repology.org/badge/latest-versions/${projectName}.svg`,
    })

    if (version === '-') {
      return { message: 'not found', color: 'red' }
    }

    return this.constructor.render({ version })
  }
}
