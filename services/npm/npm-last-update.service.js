import Joi from 'joi'
import dayjs from 'dayjs'
import { pathParam, queryParam } from '../index.js'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import NpmBase, { packageNameDescription } from './npm-base.js'

const updateResponseSchema = Joi.object({
  time: Joi.object({
    modified: Joi.string().required(),
  })
    .pattern(Joi.string(), Joi.any())
    .required(),
}).required()

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
            example: 'express',
            packageNameDescription,
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
          queryParam({
            name: 'version',
            example: '5.0.0',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'last updated' }

  static render({ date }) {
    return {
      message: formatDate(date),
      color: ageColor(date),
    }
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, registryUrl } = this.constructor.unpackParams(
      namedParams,
      queryParams,
    )

    const { time } = await this.fetch({
      registryUrl,
      scope,
      packageName,
      schema: updateResponseSchema,
    })

    const date = dayjs(time.modified)

    return this.constructor.render({ date })
  }
}
