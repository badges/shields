import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService, NotFound } from '../index.js'

const schema = Joi.object({
  score: Joi.number(),
})
  .allow(null)
  .required()

export default class HackerNewsStoryScore extends BaseJsonService {
  static category = 'analysis'

  static route = {
    base: 'hackernews/story/score',
    pattern: ':id',
  }

  static examples = [
    {
      title: 'HackerNews Story Score',
      namedParams: { id: '8863' },
      staticPreview: this.render({ id: '8863', score: 104 }),
    },
  ]

  static defaultBadgeData = {
    label: 'score',
    namedLogo: 'ycombinator',
  }

  static render({ score }) {
    const color = score > 0 ? 'brightgreen' : score === 0 ? 'orange' : 'red'
    return {
      label: 'score',
      message: metric(score),
      color,
    }
  }

  async fetch({ id }) {
    return this._requestJson({
      schema,
      url: `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`,
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
    const { score } = json
    return this.constructor.render({
      score,
    })
  }
}
