import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import WeblateBase, { defaultServer, description } from './weblate-base.js'

const schema = Joi.object({
  translated: nonNegativeInteger,
  suggested: nonNegativeInteger,
  uploaded: nonNegativeInteger,
  commented: nonNegativeInteger,
  languages: nonNegativeInteger,
}).required()

const statisticKeyNames = {
  translations: 'translated',
  suggestions: 'suggested',
  uploads: 'uploaded',
  comments: 'commented',
  languages: 'languages',
}

export default class WeblateUserStatistic extends WeblateBase {
  static category = 'other'

  static route = {
    base: 'weblate',
    pattern:
      ':statistic(translations|suggestions|languages|uploads|comments)/:user',
    queryParamSchema: this.queryParamSchema,
  }

  static openApi = {
    '/weblate/{statistic}/{user}': {
      get: {
        summary: 'Weblate user statistic',
        description,
        parameters: [
          pathParam({
            name: 'statistic',
            example: 'translations',
            schema: { type: 'string', enum: this.getEnum('statistic') },
          }),
          pathParam({ name: 'user', example: 'nijel' }),
          queryParam({ name: 'server', example: defaultServer }),
        ],
      },
    },
  }

  static _cacheLength = 600

  static defaultBadgeData = { color: 'informational' }

  static render({ statistic, count }) {
    return { label: statistic, message: metric(count) }
  }

  async fetch({ user, server = defaultServer }) {
    return super.fetch({
      schema,
      url: `${server}/api/users/${user}/statistics/`,
      httpErrors: {
        403: 'access denied by remote server',
        404: 'user not found',
      },
      logErrors: server === defaultServer ? [429] : [],
    })
  }

  async handle({ user, statistic }, { server }) {
    const data = await this.fetch({ user, server })
    const key = statisticKeyNames[statistic]
    return this.constructor.render({ statistic, count: data[key] })
  }
}
