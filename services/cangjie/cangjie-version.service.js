import Joi from 'joi'
import {
  BaseJsonlService,
  InvalidParameter,
  NotFound,
  pathParam,
  queryParam,
} from '../index.js'
import { latest, renderVersionBadge } from '../version.js'

const queryParamSchema = Joi.object({
  organization: Joi.string(),
}).required()

const indexEntrySchema = Joi.object({
  organization: Joi.string(),
  name: Joi.string().required(),
  version: Joi.string().required(),
  yanked: Joi.boolean().required(),
  'index-version': Joi.string().required(),
}).required()

const description =
  '[Cangjie Central Repository](https://pkg.cangjie-lang.cn/index) hosts packages for the Cangjie programming language.'

export default class CangjieVersion extends BaseJsonlService {
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

  static defaultBadgeData = { label: 'cangjie' }

  static getIndexPath({ moduleName }) {
    if (moduleName.length < 3) {
      throw new InvalidParameter({ prettyMessage: 'invalid module name' })
    }

    if (moduleName.length === 3) {
      return `${moduleName.slice(0, 2)}/${moduleName[2]}/${moduleName}`
    }

    return `${moduleName.slice(0, 2)}/${moduleName.slice(2, 4)}/${moduleName}`
  }

  static getLatestVersion(entries) {
    const version = latest(
      entries.filter(({ yanked }) => !yanked).map(({ version }) => version),
    )

    if (version === undefined) {
      throw new NotFound({ prettyMessage: 'no releases' })
    }

    return version
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ moduleName, organization }) {
    const indexPath = this.constructor.getIndexPath({ moduleName })
    const options = organization
      ? { searchParams: { organization } }
      : undefined

    return this._requestJsonl({
      schema: indexEntrySchema,
      url: `https://pkg.cangjie-lang.cn/registry/index/${indexPath}`,
      options,
      prettyErrorMessage: 'invalid index entry',
    })
  }

  async handle({ moduleName }, { organization }) {
    const entries = await this.fetch({ moduleName, organization })
    const version = this.constructor.getLatestVersion(entries)
    return this.constructor.render({ version })
  }
}
