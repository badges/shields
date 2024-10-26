import Joi from 'joi'
import dayjs from 'dayjs'
import { optionalUrl } from '../validators.js'
import {
  BaseJsonService,
  InvalidParameter,
  pathParam,
  queryParam,
} from '../index.js'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'

const queryParamSchema = Joi.object({
  registry_uri: optionalUrl,
  version: Joi.string(),
}).required()

const updateResponseSchema = Joi.object({
  time: Joi.object({
    created: Joi.string().required(),
    modified: Joi.string().required(),
  })
    .pattern(Joi.string(), Joi.any())
    .required(),
}).required()

const defaultUrl = 'https://registry.npmjs.org'

export class NpmLastUpdate extends BaseJsonService {
  static category = 'activity'

  static route = {
    base: 'npm/last-update',
    pattern: ':packageName',
    queryParamSchema,
  }

  static openApi = {
    '/npm/last-update/{packageName}': {
      get: {
        summary: 'NPM Last Update',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'express',
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

  async handle({ packageName }, queryParams) {
    let url

    if (queryParams !== undefined && queryParams.registry_uri !== undefined) {
      url = `${queryParams.registry_uri}/${packageName}`
    } else {
      url = `${defaultUrl}/${packageName}`
    }

    const { time } = await this._requestJson({
      schema: updateResponseSchema,
      url,
      httpErrors: { 404: 'package not found' },
    })

    let date
    if (queryParams !== undefined && queryParams.version !== undefined) {
      if (time[queryParams.version] === undefined) {
        throw new InvalidParameter({ prettyMessage: 'version not found' })
      }
      date = dayjs(time[queryParams.version])
    } else {
      date = dayjs(time.modified)
    }

    return this.constructor.render({ date })
  }
}
