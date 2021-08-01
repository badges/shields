import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  version: Joi.string().required(),
}).required()

// No way to permalink to current "stable", https://pagure.io/mdapi/issue/69
const defaultBranch = 'rawhide'

export default class Fedora extends BaseJsonService {
  static category = 'version'
  static route = { base: 'fedora/v', pattern: ':packageName/:branch?' }
  static examples = [
    {
      title: 'Fedora package',
      namedParams: { packageName: 'rpm', branch: 'rawhide' },
      staticPreview: renderVersionBadge({ version: '4.14.2.1' }),
      documentation:
        'See <a href="https://apps.fedoraproject.org/mdapi/">mdapi docs</a> for information on valid branches.',
    },
  ]

  static defaultBadgeData = { label: 'fedora' }

  async handle({ packageName, branch = defaultBranch }) {
    const data = await this._requestJson({
      schema,
      url: `https://apps.fedoraproject.org/mdapi/${encodeURIComponent(
        branch
      )}/pkg/${encodeURIComponent(packageName)}`,
      errorMessages: {
        400: 'branch not found',
      },
    })
    return renderVersionBadge({ version: data.version })
  }
}
