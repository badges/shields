import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { nonNegativeInteger, optionalUrl } from '../validators.js'
import { metric } from '../text-formatters.js'

const schema = Joi.object({
  translated: nonNegativeInteger,
  suggested: nonNegativeInteger,
  uploaded: nonNegativeInteger,
  commented: nonNegativeInteger,
  languages: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

const statisticKeyNames = {
  translations: 'translated',
  suggestions: 'suggested',
  uploads: 'uploaded',
  comments: 'commented',
  languages: 'languages',
}

export default class WeblateUserStatistic extends BaseJsonService {
  static category = 'other'
  static route = {
    base: 'weblate',
    pattern:
      ':statistic(translations|suggestions|languages|uploads|comments)/:user',
    queryParamSchema,
  }

  static examples = [
    {
      title: `Weblate user statistic`,
      namedParams: { statistic: 'translations', user: 'nijel' },
      queryParams: { server: 'https://hosted.weblate.org' },
      staticPreview: this.render({ statistic: 'translations', count: 30585 }),
      keywords: ['i18n', 'internationalization'],
    },
  ]

  static defaultBadgeData = { color: 'informational' }

  static render({ statistic, count }) {
    return { label: statistic, message: metric(count) }
  }

  async fetch({ user, server = 'https://hosted.weblate.org' }) {
    return this._requestJson({
      schema,
      url: `${server}/api/users/${user}/statistics/`,
      errorMessages: {
        403: 'access denied by remote server',
        404: 'user not found',
        429: 'rate limited by remote server',
      },
    })
  }

  async handle({ user, statistic }, { server }) {
    const data = await this.fetch({ user, server })
    const key = statisticKeyNames[statistic]
    return this.constructor.render({ statistic, count: data[key] })
  }
}
