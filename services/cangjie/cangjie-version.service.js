import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { BaseCangjieService } from './cangjie-base.js'

const queryParamSchema = Joi.object({
  organization: Joi.string(),
}).required()

const description =
  '[Cangjie Central Repository](https://pkg.cangjie-lang.cn/index) hosts packages for the Cangjie programming language.'

export default class CangjieVersion extends BaseCangjieService {
  static category = 'version'
  static route = {
    base: 'cangjie',
    pattern: ':moduleName',
    queryParamSchema,
  }

  static openApi = {
    '/cangjie/{moduleName}': {
      get: {
        summary: 'Cangjie Version',
        description,
        parameters: [
          pathParam({
            name: 'moduleName',
            example: 'stdx',
          }),
          queryParam({
            name: 'organization',
            example: 'fountain',
            description: 'Optional organization name for organization modules.',
            required: false,
          }),
        ],
      },
    },
  }

  async handle({ moduleName }, { organization }) {
    const entries = await this.fetch({ moduleName, organization })
    const version = this.constructor.getLatestVersion(entries)
    return renderVersionBadge({ version })
  }
}
