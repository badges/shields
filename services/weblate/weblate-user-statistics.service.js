'use strict'

const Joi = require('joi')
const camelcase = require('camelcase')
const { BaseJsonService } = require('..')
const { nonNegativeInteger, optionalUrl } = require('../validators')
const { metric } = require('../text-formatters')

const schema = Joi.object({
  translated: nonNegativeInteger,
  suggested: nonNegativeInteger,
  uploaded: nonNegativeInteger,
  commented: nonNegativeInteger,
  languages: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl.required(),
}).required()

class WeblateUserStatisticBase extends BaseJsonService {
  static category = 'other'

  static buildRoute(statistic) {
    return {
      base: 'weblate/user',
      pattern: `:user/${statistic}`,
      queryParamSchema,
    }
  }

  static defaultBadgeData = { color: 'informational' }

  async fetch({ user, server }) {
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
}

function WeblateUserStatisticFactory({
  statisticName,
  property,
  exampleValue,
}) {
  return class WeblateUserStatistic extends WeblateUserStatisticBase {
    static name = camelcase(`Weblate user ${statisticName}`, {
      pascalCase: true,
    })

    static route = this.buildRoute(statisticName)

    static examples = [
      {
        title: `Weblate user ${statisticName}`,
        namedParams: { user: 'nijel' },
        queryParams: { server: 'https://hosted.weblate.org' },
        staticPreview: this.render({ count: exampleValue }),
        keywords: ['i18n', 'internationalization'],
      },
    ]

    static render({ count }) {
      return { label: statisticName, message: metric(count) }
    }

    async handle({ user }, { server }) {
      const data = await this.fetch({ user, server })
      return this.constructor.render({ count: data[property] })
    }
  }
}

const userStatistics = [
  {
    statisticName: 'translations',
    property: 'translated',
    exampleValue: 30585,
  },
  { statisticName: 'suggestions', property: 'suggested', exampleValue: 7 },
  { statisticName: 'languages', property: 'languages', exampleValue: 1 },
].map(WeblateUserStatisticFactory)

module.exports = [...userStatistics]
