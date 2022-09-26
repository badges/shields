import Joi from 'joi'
import { BaseJsonService, NotFound } from '../index.js'

const schema = Joi.object({
  Keys: Joi.string().required(),
  Clicks: Joi.string().required(),
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
  stat_name: Joi.string().required(),
}).required()

export default class WhatPulse extends BaseJsonService {
  static category = 'activity'
  static route = { base: 'whatpulse', pattern: ':user', queryParamSchema }
  static examples = [
    {
      title: 'WhatPulse user stats - Keys',
      namedParams: { user: 'jerone' },
      queryParams: { stat_name: 'keys' },
      staticPreview: this.render({ statName: 'Keys', statValue: '26448513' }),
    },
    {
      title: 'WhatPulse user stats - Rank in Clicks',
      namedParams: { user: 'jerone' },
      queryParams: { stat_name: 'Rank/Clicks' },
      staticPreview: this.render({
        statName: 'Rank/Clicks',
        statValue: '5444',
      }),
    },
  ]

  static defaultBadgeData = { label: 'WhatPulse' }

  static render({ statName, statValue }) {
    return {
      label: `WhatPulse ${statName}`,
      message: statValue,
      color: '#374856',
    }
  }

  async fetch({ user }) {
    return await this._requestJson({
      schema,
      url: `https://api.whatpulse.org/user.php?user=${user}&format=json`,
    })
  }

  transform({ json, statName }) {
    let stat

    if (!statName.includes('/')) {
      const statNameCapitalized =
        statName.charAt(0).toUpperCase() + statName.toLowerCase().slice(1)

      stat = json[statNameCapitalized]
    } else {
      const rankTypeStart = statName.indexOf('/')
      const statNameCapitalized =
        statName.charAt(rankTypeStart + 1).toUpperCase() +
        statName.toLowerCase().slice(rankTypeStart + 2)

      stat = json.Ranks[statNameCapitalized]
    }

    if (stat) {
      return stat
    } else {
      throw new NotFound({ prettyMessage: 'invalid stat_name' })
    }
  }

  async handle({ user }, { stat_name: statName }) {
    const json = await this.fetch({ user, statName })
    const statValue = this.transform({ json, statName })

    return this.constructor.render({ statName, statValue })
  }
}
