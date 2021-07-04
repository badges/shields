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

export default class WeblateUserStatistic extends BaseJsonService {
  static category = 'other'
  static route = {
    base: 'weblate/user',
    pattern:
      ':user/:statistic(translated|suggested|languages|uploaded|commented)',
    queryParamSchema,
  }

  static examples = [
    {
      title: `Weblate user statistic`,
      namedParams: { user: 'nijel', statistic: 'translated' },
      queryParams: { server: 'https://hosted.weblate.org' },
      staticPreview: this.render({ type: 'translated', count: 30585 }),
      keywords: ['i18n', 'internationalization'],
    },
  ]

  static defaultBadgeData = { color: 'informational' }

  static render({ type, count }) {
    return { label: type, message: metric(count) }
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
    return this.constructor.render({ type: statistic, count: data[statistic] })
  }
}
