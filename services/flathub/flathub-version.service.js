import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  releases: Joi.array().items(
    Joi.object({
      timestamp: Joi.string().required(),
      version: Joi.string().required(),
    }).required(),
  ),
}).required()

export default class FlathubVersion extends BaseJsonService {
  static category = 'version'
  static route = { base: 'flathub/v', pattern: ':packageName' }
  static openApi = {
    '/flathub/v/{packageName}': {
      get: {
        summary: 'Flathub Version',
        parameters: pathParams({
          name: 'packageName',
          example: 'org.mozilla.firefox',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'flathub' }

  async handle({ packageName }) {
    const { releases } = await this._requestJson({
      schema,
      url: `https://flathub.org/api/v2/appstream/${encodeURIComponent(packageName)}`,
    })

    const latestRelease = releases.sort(
      (a, b) => parseInt(a['timestamp']) - parseInt(b['timestamp']),
    )[releases.length - 1]

    return renderVersionBadge({ version: latestRelease['version'] })
  }
}
