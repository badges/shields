import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { NotFound } from '../index.js'
import HackerNewsBase, { getColorOfBadge } from './hackernews-base.js'

const schema = Joi.object({
  descendants: Joi.number(),
})
  .allow(null)
  .required()

export default class HackerNewsStoryComments extends HackerNewsBase {
  static category = 'analysis'

  static route = {
    base: 'hackernews/item/comments',
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
  }

  static render({ comments }) {
    const color = getColorOfBadge(comments)
    return {
      label: 'comments',
      message: metric(comments),
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
    const { descendants } = json
    return this.constructor.render({
      comments: descendants,
    })
  }
}
