import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService, NotFound } from '../index.js'
import { anyInteger } from '../validators.js'

const schema = Joi.object({
  karma: anyInteger,
})
  .allow(null)
  .required()

export default class HackerNewsUserKarma extends BaseJsonService {
  static category = 'social'

  static route = {
    base: 'hackernews/user-karma',
    pattern: ':id',
  }

  static examples = [
    {
      title: 'HackerNews User Karma',
      namedParams: { id: 'pg' },
      staticPreview: this.render({ id: 'pg', karma: 15536 }),
    },
  ]

  static defaultBadgeData = {
    label: 'Karma',
    namedLogo: 'ycombinator',
  }

  static render({ karma, id }) {
    const color = karma > 0 ? 'brightgreen' : karma === 0 ? 'orange' : 'red'
    return {
      label: `U/${id} karma`,
      message: metric(karma),
      color,
      style: 'social',
    }
  }

  async fetch({ id }) {
    return this._requestJson({
      schema,
      url: `https://hacker-news.firebaseio.com/v0/user/${id}.json`,
      errorMessages: {
        404: 'user not found',
      },
    })
  }

  async handle({ id }) {
    const json = await this.fetch({ id })
    if (json == null) {
      throw new NotFound({ prettyMessage: 'user not found' })
    }
    const { karma } = json
    return this.constructor.render({
      karma,
      id,
    })
  }
}
