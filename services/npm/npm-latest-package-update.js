import Joi from 'joi'
import { BaseService, pathParams } from '../index.js'
import { formatRelativeDate } from '../text-formatters.js'

const schema = Joi.object({
  time: Joi.object({
    modified: Joi.date().optional(),
    created: Joi.date().required(),
  }).required(),
}).required()

const description = `
Supply package name to display the latest package update time
`

export default class NpmLatestPackageUpdate extends BaseService {
  static category = 'version'

  static route = {
    base: '/npm/latest-update/',
    pattern: ':name',
  }

  static openApi = {
    '/npm/latest-update/{name}': {
      get: {
        summary: 'NPM latest package update time',
        description,
        parameters: pathParams({
          name: 'name',
          example: 'npm',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'published',
    color: 'blue',
  }

  static render({ time }) {
    return {
      message: time,
      label: this.defaultBadgeData.label,
      color: this.defaultBadgeData.color,
    }
  }

  async fetch({ name }) {
    return this._requestJson({
      schema,
      url: `https://registry.npmjs.org/${name}`,
    })
  }

  async handle({ name }) {
    const data = await this.fetch({ name })

    return this.constructor.render({
      time: formatRelativeDate(data.time),
    })
  }
}
