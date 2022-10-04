import Joi from 'joi'
import { BaseJsonService, NotFound } from '../index.js'
import { ordinalNumber } from '../text-formatters.js'

const schema = Joi.object({
  Keys: Joi.alternatives(Joi.string(), Joi.number()).required(),
  Clicks: Joi.alternatives(Joi.string(), Joi.number()).required(),
  UptimeShort: Joi.string().required(),
  Download: Joi.string().required(),
  Upload: Joi.string().required(),
  Ranks: Joi.object({
    Keys: Joi.string().required(),
    Clicks: Joi.string().required(),
    Download: Joi.string().required(),
    Upload: Joi.string().required(),
    Uptime: Joi.string().required(),
  }),
}).required()

const queryParamSchema = Joi.object({
  rank: Joi.equal(''),
}).required()

export default class WhatPulse extends BaseJsonService {
  static category = 'activity'
  static route = {
    base: 'whatpulse',
    pattern:
      ':metric(keys|clicks|uptime|download|upload)/:userType(user|team)/:id',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'WhatPulse user metric',
      namedParams: { metric: 'keys', userType: 'user', id: '179734' },
      staticPreview: this.render({
        metric: 'keys',
        metricValue: '26448513',
      }),
    },
    {
      title: 'WhatPulse team metric - rank',
      namedParams: {
        metric: 'upload',
        userType: 'team',
        id: 'dutch power cows',
      },
      queryParams: { rank: null },
      staticPreview: this.render({
        metric: 'upload',
        metricValue: '1ˢᵗ',
      }),
    },
  ]

  static defaultBadgeData = { label: 'WhatPulse' }

  static render({ metric, metricValue }) {
    return {
      label: metric,
      message: metricValue,
      color: 'informational',
    }
  }

  async fetch({ userType, id }) {
    return await this._requestJson({
      schema,
      url: `https://api.whatpulse.org/${userType}.php?${userType}=${id}&format=json`,
    })
  }

  toLowerKeys(obj) {
    return Object.keys(obj).reduce((accumulator, key) => {
      accumulator[key.toLowerCase()] = obj[key]
      return accumulator
    }, {})
  }

  transform({ json, metric }, { rank }) {
    let metricValue

    // We want to compare with lowercase keys from the WhatPulse's API.
    const jsonLowercase = this.toLowerKeys(json)
    jsonLowercase.ranks = this.toLowerKeys(json.Ranks)

    // Just metric, no rank.
    if (rank === undefined) {
      metricValue = jsonLowercase[metric]

      // For uptime, we take the value from the `UptimeShort` field from the WhatPulse's API response.
      if (metric === 'uptime') {
        metricValue = jsonLowercase.uptimeshort
      }

      // Rank achieved by the user/team with the given metric.
    } else {
      const rankFromResp = jsonLowercase.ranks[metric]
      metricValue = ordinalNumber(rankFromResp)
    }

    if (metricValue) {
      return metricValue
    } else {
      throw new NotFound({ prettyMessage: 'invalid metric' })
    }
  }

  async handle({ metric, userType, id }, { rank }) {
    const json = await this.fetch({ userType, id, metric })
    const metricValue = this.transform({ json, metric }, { rank })

    return this.constructor.render({ metric, metricValue })
  }
}
