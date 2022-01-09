import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { NotFound } from '../index.js'
import HackerNewsBase, { getColorOfBadge } from './hackernews-base.js'

const schema = Joi.object({
  score: Joi.number(),
})
  .allow(null)
  .required()

export default class HackerNewsStoryScore extends HackerNewsBase {
  static category = 'analysis'

  static route = {
    base: 'hackernews/item/score',
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
  }

  static render({ score }) {
    const color = getColorOfBadge(score)
    return {
      label: 'score',
      message: metric(score),
      color,
    }
  }

  async fetch({ id }) {
    return super.fetchHNStory({
      schema,
      id,
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
