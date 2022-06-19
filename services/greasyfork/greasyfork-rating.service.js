import { metric } from '../text-formatters.js'
import BaseGreasyForkService from './greasyfork-base.js'

export default class GreasyForkRatingCount extends BaseGreasyForkService {
  static category = 'rating'
  static route = { base: 'greasyfork', pattern: 'rating-count/:scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ good: 17, ok: 2, bad: 3 }),
    },
  ]

  static defaultBadgeData = { label: 'rating' }

  static render({ good, ok, bad }) {
    const installs = [good, ok, bad]
    const colors = ['green', 'yellow', 'red']
    return {
      message: `${metric(good)} good, ${metric(ok)} ok, ${metric(bad)} bad`,
      color: colors[installs.indexOf(Math.max(...installs))],
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
