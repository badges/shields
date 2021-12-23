import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService, NotFound } from '../index.js'
import { anyInteger } from '../validators.js'

const schema = Joi.object({
  id: Joi.string(),
  karma: anyInteger,
})
  .allow(null)
  .required()

export default class HackerNewsUserKarma extends BaseJsonService {
  static category = 'social'

  static route = {
    base: 'hackernews/user-karma',
    pattern: ':userid',
  }

  static examples = [
    {
      title: 'HackerNews User Karma',
      namedParams: { userid: 'pg' },
      staticPreview: this.render({ userid: 'pg', karma: '156359' }),
    },
  ]

  static defaultBadgeData = {
    label: 'HackerNews User Karma',
    namedLogo: 'ycombinator',
  }

  static render({ karma, userid }) {
    const color = karma > 0 ? 'brightgreen' : karma === 0 ? 'orange' : 'red'
    return {
      label: userid,
      message: metric(karma),
      color,
      style: 'social',
    }
  }

  async fetch({ userid }) {
    return this._requestJson({
      schema,
      url: `https://hacker-news.firebaseio.com/v0/user/${userid}.json`,
      errorMessages: {
        404: 'user not found',
      },
    })
  }

  transform({ json }) {
    if (json == null) {
      throw new NotFound({ prettyMessage: 'user not found' })
    }

    const { karma, id } = json
    return { karma, id }
  }

  async handle({ userid }) {
    const json = await this.fetch({ userid })
    const { karma, id } = this.transform({ json })
    return this.constructor.render({
      karma,
      userid: id,
    })
  }
}
