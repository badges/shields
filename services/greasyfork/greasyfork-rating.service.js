import { floorCount as floorCountColor } from '../color-formatters.js'
import { metric } from '../text-formatters.js'
import BaseGreasyForkService from './greasyfork-base.js'

export default class BaseGreasyForkRatingCount extends BaseGreasyForkService {
  static category = 'rating'
  static route = {
    base: 'greasyfork',
    pattern:
      ':variant(good-rating-count|ok-rating-count|bad-rating-count|rating-count)/:scriptId',
  }

  static examples = [
    {
      title: 'Greasy Fork',
      pattern: 'rating-count/:scriptId',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ variant: 'total', ratingCount: 22 }),
    },
    {
      title: 'Greasy Fork',
      pattern: 'good-rating-count/:scriptId',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ variant: 'good', ratingCount: 17 }),
    },
    {
      title: 'Greasy Fork',
      pattern: 'ok-rating-count/:scriptId',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ variant: 'ok', ratingCount: 2 }),
    },
    {
      title: 'Greasy Fork',
      pattern: 'bad-rating-count/:scriptId',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ variant: 'bad', ratingCount: 3 }),
    },
  ]

  static defaultBadgeData = { label: 'rating' }

  static render({ variant, ratingCount }) {
    let color = floorCountColor(ratingCount, 5, 50, 500)
    color = variant === 'good' ? 'green' : color
    color = variant === 'ok' ? 'yellow' : color
    color = variant === 'bad' ? 'red' : color
    return { message: `${metric(ratingCount)} ${variant}`, color }
  }

  async handle({ variant, scriptId }) {
    const data = await this.fetch({ scriptId })
    if (variant === 'good-rating-count') {
      return this.constructor.render({
        variant: 'good',
        ratingCount: data.good_ratings,
      })
    } else if (variant === 'ok-rating-count') {
      return this.constructor.render({
        variant: 'ok',
        ratingCount: data.ok_ratings,
      })
    } else if (variant === 'bad-rating-count') {
      return this.constructor.render({
        variant: 'bad',
        ratingCount: data.bad_ratings,
      })
    }
    return this.constructor.render({
      variant: 'total',
      ratingCount: data.good_ratings + data.ok_ratings + data.bad_ratings,
    })
  }
}
