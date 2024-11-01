import Joi from 'joi'
import dayjs from 'dayjs'
import { NotFound, pathParam, queryParam } from '../index.js'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import NpmBase, { packageNameDescription } from './npm-base.js'

const updateResponseSchema = Joi.object({
  time: Joi.object({
    created: Joi.string().required(),
    modified: Joi.string().required(),
  })
    .pattern(Joi.string(), Joi.any())
    .required(),
  'dist-tags': Joi.object().pattern(Joi.string(), Joi.string()).required(),
}).required()

export class NpmLastUpdate extends NpmBase {
  static category = 'activity'

  static route = this.buildRoute('npm/last-update', { withTag: true })

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

  static render({ date }) {
    return {
      message: formatDate(date),
      color: ageColor(date),
    }
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, tag, registryUrl } =
      this.constructor.unpackParams(namedParams, queryParams)

    const packageData = await this.fetch({
      registryUrl,
      scope,
      packageName,
      schema: updateResponseSchema,
    })

    let date

    if (tag && tag in packageData['dist-tags']) {
      const tagVersion = packageData['dist-tags'][tag]
      date = dayjs(packageData.time[tagVersion])
    } else if (tag && !(tag in packageData['dist-tags'])) {
      throw new NotFound({ prettyMessage: 'tag not found' })
    } else {
      date = packageData.time.modified
        ? dayjs(packageData.time.modified)
        : dayjs(packageData.time.created)
    }

    return this.constructor.render({ date })
  }
}
