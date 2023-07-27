import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound } from '../index.js'

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
  static examples = [
    {
      title: 'Flathub',
      namedParams: {
        packageName: 'org.mozilla.firefox',
      },
      staticPreview: renderVersionBadge({ version: '78.0.2' }),
    },
  ]

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
