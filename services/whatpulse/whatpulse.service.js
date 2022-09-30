import Joi from 'joi'
import { BaseJsonService, NotFound } from '../index.js'

const schema = Joi.object({
  Keys: Joi.alternatives(Joi.string(), Joi.number()),
  Clicks: Joi.alternatives(Joi.string(), Joi.number()),
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
  category: Joi.string().required(),
}).required()

export default class WhatPulse extends BaseJsonService {
  static category = 'activity'
  static route = {
    base: 'whatpulse',
    pattern: ':userOrTeam/:id',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'WhatPulse user stats - Keys',
      namedParams: { userOrTeam: 'user', id: 'jerone' },
      queryParams: { category: 'keys' },
      staticPreview: this.render({
        category: 'Keys',
        categoryValue: '26448513',
      }),
    },
    {
      title: 'WhatPulse user stats - Ranks in Upload',
      namedParams: { userOrTeam: 'user', id: 'jerone' },
      queryParams: { category: 'Ranks/Upload' },
      staticPreview: this.render({
        category: 'Ranks/Upload',
        categoryValue: '5444',
      }),
    },
    {
      title: 'WhatPulse team stats - UptimeShort',
      namedParams: { userOrTeam: 'team', id: '1295' },
      queryParams: { category: 'UptimeShort' },
      staticPreview: this.render({
        category: 'UptimeShort',
        categoryValue: '21344764434',
      }),
    },
    {
      title: 'WhatPulse team stats - Ranks in Download',
      namedParams: { userOrTeam: 'team', id: 'dutch power cows' },
      queryParams: { category: 'Ranks/Download' },
      staticPreview: this.render({
        category: 'Ranks/Download',
        categoryValue: '1',
      }),
    },
  ]

  static defaultBadgeData = { label: 'WhatPulse' }

  static render({ category, categoryValue }) {
    return {
      label: `WhatPulse ${category}`,
      message: categoryValue,
      color: '#374856',
    }
  }

  async fetch({ userOrTeam, id }) {
    return await this._requestJson({
      schema,
      url: `https://api.whatpulse.org/${userOrTeam}.php?${userOrTeam}=${id}&format=json`,
    })
  }

  toLowerKeys(obj) {
    return Object.keys(obj).reduce((accumulator, key) => {
      accumulator[key.toLowerCase()] = obj[key]
      return accumulator
    }, {})
  }

  transform({ json, category }) {
    let categoryName

    // To enable comparisons with the categories from the url that were written in varied cases, we need to lowercase the keys in the object from the WhatPulse's API.
    const jsonLowercase = this.toLowerKeys(json)
    const lowercaseRanks = this.toLowerKeys(json.Ranks)
    jsonLowercase.ranks = lowercaseRanks

    // When the user wants to show Ranks/Keys | Ranks/Clicks | Ranks/Download | Ranks/Upload | Ranks/Uptime,
    // the slash will be present and we need to extract the word after the slash.
    // When there is no slash, we can directly use te lowercase version of the single present word to compare it against the lowercased response from the WhatPulse's API.

    if (!category.includes('/')) {
      categoryName = jsonLowercase[category.toLowerCase()]
    } else {
      const rankTypeStart = category.indexOf('/')
      const categoryLowercase = category.toLowerCase().slice(rankTypeStart + 1)
      categoryName = jsonLowercase.ranks[categoryLowercase]
    }

    if (categoryName) {
      return categoryName
    } else {
      throw new NotFound({ prettyMessage: 'invalid category' })
    }
  }

  async handle({ userOrTeam, id }, { category }) {
    const json = await this.fetch({ userOrTeam, id, category })
    const categoryValue = this.transform({ json, category })

    return this.constructor.render({ category, categoryValue })
  }
}
