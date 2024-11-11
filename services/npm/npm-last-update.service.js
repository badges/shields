import Joi from 'joi'
import dayjs from 'dayjs'
import { InvalidResponse, NotFound, pathParam, queryParam } from '../index.js'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
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

class NpmLastUpdateBase extends NpmBase {
  static category = 'activity'

  static defaultBadgeData = { label: 'last updated' }

  static render({ date }) {
    return {
      message: formatDate(date),
      color: ageColor(date),
    }
  }
}

export class NpmLastUpdateWithTag extends NpmLastUpdateBase {
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

    const date = dayjs(packageData.time[tagVersion])

    if (!date.isValid) {
      throw new InvalidResponse({ prettyMessage: 'invalid date' })
    }

    return this.constructor.render({ date })
  }
}

export class NpmLastUpdate extends NpmLastUpdateBase {
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

    const date = dayjs(packageData.modified)

    if (!date.isValid) {
      throw new InvalidResponse({ prettyMessage: 'invalid date' })
    }

    return this.constructor.render({ date })
  }
}
