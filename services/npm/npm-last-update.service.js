import Joi from 'joi'
import { NotFound, pathParam, queryParam } from '../index.js'
import { renderDateBadge } from '../date.js'
import NpmBase, {
  packageNameDescription,
  queryParamSchema,
} from './npm-base.js'

const fullSchema = Joi.object({
  time: Joi.object()
    .pattern(Joi.string().required(), Joi.string().required())
    .required(),
  'dist-tags': Joi.object()
    .pattern(Joi.string().required(), Joi.string().required())
    .required(),
}).required()

const abbreviatedSchema = Joi.object({
  modified: Joi.string().required(),
}).required()

export class NpmLastUpdateWithTag extends NpmBase {
  static category = 'activity'

  static route = {
    base: 'npm/last-update',
    pattern: ':scope(@[^/]+)?/:packageName/:tag',
    queryParamSchema,
  }

  static openApi = {
    '/npm/last-update/{packageName}/{tag}': {
      get: {
        summary: 'NPM Last Update (with dist tag)',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'verdaccio',
            packageNameDescription,
          }),
          pathParam({
            name: 'tag',
            example: 'next-8',
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'last updated' }

  async handle(namedParams, queryParams) {
    const { scope, packageName, tag, registryUrl } =
      this.constructor.unpackParams(namedParams, queryParams)

    const packageData = await this.fetch({
      registryUrl,
      scope,
      packageName,
      schema: fullSchema,
    })

    const tagVersion = packageData['dist-tags'][tag]

    if (!tagVersion) {
      throw new NotFound({ prettyMessage: 'tag not found' })
    }

    return renderDateBadge(packageData.time[tagVersion])
  }
}

export class NpmLastUpdate extends NpmBase {
  static category = 'activity'

  static route = this.buildRoute('npm/last-update', { withTag: false })

  static openApi = {
    '/npm/last-update/{packageName}': {
      get: {
        summary: 'NPM Last Update',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'verdaccio',
            packageNameDescription,
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'last updated' }

  async handle(namedParams, queryParams) {
    const { scope, packageName, registryUrl } = this.constructor.unpackParams(
      namedParams,
      queryParams,
    )

    const packageData = await this.fetch({
      registryUrl,
      scope,
      packageName,
      schema: abbreviatedSchema,
      abbreviated: true,
    })

    return renderDateBadge(packageData.modified)
  }
}
