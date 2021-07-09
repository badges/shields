import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  currentReleaseVersion: Joi.string().required(),
}).required()

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
    return renderVersionBadge({ version: data.currentReleaseVersion })
  }
}
