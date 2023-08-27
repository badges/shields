import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'

const schema = Joi.alternatives()
  .try(
    Joi.object({
      currentReleaseVersion: Joi.string().required(),
    }).required(),
    Joi.valid(null).required(),
  )
  .required()

export default class Flathub extends BaseJsonService {
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
    const data = await this._requestJson({
      schema,
      url: `https://flathub.org/api/v1/apps/${encodeURIComponent(packageName)}`,
    })

    // the upstream API indicates "not found"
    // by returning a 200 OK with a null body
    if (data === null) {
      throw new NotFound()
    }

    return renderVersionBadge({ version: data.currentReleaseVersion })
  }
}
