import Joi from 'joi'
import dayjs from 'dayjs'
import calendar from 'dayjs/plugin/calendar.js'
import duration from 'dayjs/plugin/duration.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import { BaseJsonService, pathParam, queryParam } from '../index.js'
import { metric as formatMetric, ordinalNumber } from '../text-formatters.js'
dayjs.extend(calendar)
dayjs.extend(duration)
dayjs.extend(relativeTime)

const schema = Joi.object({
  Keys: Joi.alternatives(Joi.string(), Joi.number()).required(),
  Clicks: Joi.alternatives(Joi.string(), Joi.number()).required(),
  UptimeSeconds: Joi.alternatives(Joi.string(), Joi.number()).required(),
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

  static openApi = {
    '/whatpulse/{metric}/{userType}/{id}': {
      get: {
        summary: 'WhatPulse',
        parameters: [
          pathParam({
            name: 'metric',
            example: 'keys',
            schema: { type: 'string', enum: this.getEnum('metric') },
          }),
          pathParam({
            name: 'userType',
            example: 'team',
            schema: { type: 'string', enum: this.getEnum('userType') },
          }),
          pathParam({
            name: 'id',
            example: '179734',
            description:
              'Either a user ID (e.g: `179734`) or a group ID (e.g: `dutch power cows`)',
          }),
          queryParam({
            name: 'rank',
            description: 'show rank instead of value',
            example: null,
            schema: { type: 'boolean' },
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'whatpulse' }

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
    // We want to compare with lowercase keys from the WhatPulse's API.
    const jsonLowercase = this.toLowerKeys(json)
    jsonLowercase.ranks = this.toLowerKeys(json.Ranks)

    // Just metric, no rank.
    if (rank === undefined) {
      if (metric === 'uptime') {
        return dayjs.duration(jsonLowercase.uptimeseconds, 'seconds').humanize()
      }

      let metricValue

      metricValue = jsonLowercase[metric]

      if (metric === 'keys' || metric === 'clicks') {
        metricValue = formatMetric(metricValue)
      }

      if (metric === 'upload' || metric === 'download') {
        metricValue = metricValue.replace(/([A-Za-z]+)/, ' $1')
      }

      return metricValue
    }

    // Rank achieved by the user/team with the given metric.
    const rankFromResp = jsonLowercase.ranks[metric]

    return ordinalNumber(rankFromResp)
  }

  async handle({ metric, userType, id }, { rank }) {
    const json = await this.fetch({ userType, id, metric })
    const metricValue = this.transform({ json, metric }, { rank })

    return this.constructor.render({ metric, metricValue })
  }
}
