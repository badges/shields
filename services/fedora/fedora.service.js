import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  version: Joi.string().required(),
}).required()

// No way to permalink to current "stable", https://pagure.io/mdapi/issue/69
const defaultBranch = 'rawhide'

const description =
  'See <a href="https://apps.fedoraproject.org/mdapi/">mdapi docs</a> for information on valid branches.'

export default class Fedora extends BaseJsonService {
  static category = 'version'
  static route = { base: 'fedora/v', pattern: ':packageName/:branch?' }
  static openApi = {
    '/fedora/v/{packageName}/{branch}': {
      get: {
        summary: 'Fedora package (with branch)',
        description,
        parameters: pathParams(
          {
            name: 'packageName',
            example: 'rpm',
          },
          {
            name: 'branch',
            example: 'rawhide',
          },
        ),
      },
    },
    '/fedora/v/{packageName}': {
      get: {
        summary: 'Fedora package',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'rpm',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'fedora' }

  async handle({ packageName, branch = defaultBranch }) {
    const data = await this._requestJson({
      schema,
      url: `https://apps.fedoraproject.org/mdapi/${encodeURIComponent(
        branch,
      )}/pkg/${encodeURIComponent(packageName)}`,
      httpErrors: {
        400: 'branch not found',
      },
    })
    return renderVersionBadge({ version: data.version })
  }
}
