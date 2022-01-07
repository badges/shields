import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService, NotFound } from '../index.js'

const schema = Joi.object({
  descendants: Joi.number(),
})
  .allow(null)
  .required()

export default class HackerNewsUserKarma extends BaseJsonService {
  static category = 'analysis'

  static route = {
    base: 'hackernews/story/comments',
    pattern: ':id',
  }

  static examples = [
    {
      title: 'HackerNews Story Comments',
      namedParams: { id: '8863' },
      staticPreview: this.render({ id: '8863', comments: 104 }),
    },
  ]

  static defaultBadgeData = {
    label: 'comments',
    namedLogo: 'ycombinator',
  }

  static render({ comments }) {
    const color =
      comments > 0 ? 'brightgreen' : comments === 0 ? 'orange' : 'red'
    return {
      label: 'comments',
      message: metric(comments),
      color,
    }
  }

  async fetch({ id }) {
    return this._requestJson({
      schema,
      url: `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
      errorMessages: {
        404: 'story not found',
      },
    })
  }

  async handle({ id }) {
    const json = await this.fetch({ id })
    if (json == null) {
      throw new NotFound({ prettyMessage: 'story not found' })
    }
    const { descendants } = json
    return this.constructor.render({
      comments: descendants,
    })
  }
}
