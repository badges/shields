import { pathParams } from '../index.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { metric } from '../text-formatters.js'
import BaseGreasyForkService from './greasyfork-base.js'

export default class GreasyForkRatingCount extends BaseGreasyForkService {
  static category = 'rating'
  static route = { base: 'greasyfork', pattern: 'rating-count/:scriptId' }

  static openApi = {
    '/greasyfork/rating-count/{scriptId}': {
      get: {
        summary: 'Greasy Fork Rating',
        parameters: pathParams({
          name: 'scriptId',
          example: '407466',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'rating' }

  static render({ good, ok, bad }) {
    let color = 'lightgrey'
    const total = good + bad + ok
    if (total > 0) {
      const score = (good * 3 + ok * 2 + bad * 1) / total - 1
      color = floorCountColor(score, 1, 1.5, 2)
    }
    return {
      message: `${metric(good)} good, ${metric(ok)} ok, ${metric(bad)} bad`,
      color,
    }
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    return this.constructor.render({
      good: data.good_ratings,
      ok: data.ok_ratings,
      bad: data.bad_ratings,
    })
  }
}
