import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { nonNegativeInteger, optionalUrl } from '../validators.js'
import { metric } from '../text-formatters.js'

const schema = Joi.object({
  count: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

export default class WeblateEntities extends BaseJsonService {
  static category = 'other'
  static route = {
    base: 'weblate',
    pattern: ':type(components|projects|users|languages)',
    queryParamSchema,
  }

  static examples = [
    {
      title: `Weblate entities`,
      namedParams: { type: 'projects' },
      queryParams: { server: 'https://hosted.weblate.org' },
      staticPreview: this.render({ type: 'projects', count: 533 }),
      keywords: ['i18n', 'internationalization'],
    },
  ]

  static defaultBadgeData = { color: 'informational' }

  static render({ type, count }) {
    return { label: type, message: metric(count) }
  }

  async fetch({ type, server = 'https://hosted.weblate.org' }) {
    return this._requestJson({
      schema,
      url: `${server}/api/${type}/`,
      errorMessages: {
        403: 'access denied by remote server',
        429: 'rate limited by remote server',
      },
    })
  }

  async handle({ type }, { server }) {
    const { count } = await this.fetch({ type, server })
    return this.constructor.render({ type, count })
  }
}
