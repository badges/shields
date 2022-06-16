import { floorCount as floorCountColor } from '../color-formatters.js'
import { metric } from '../text-formatters.js'
import BaseGreasyForkService from './greasyfork-base.js'

class BaseGreasyForkRating extends BaseGreasyForkService {
  static category = 'rating'

  static defaultBadgeData = { label: 'rating' }
}

class GreasyForkRatingCount extends BaseGreasyForkRating {
  static route = { base: 'greasyfork', pattern: 'rating-count/:scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ ratingCount: 22 }),
    },
  ]

  static render({ ratingCount }) {
    return {
      message: `${metric(ratingCount)} total`,
      color: floorCountColor(ratingCount, 5, 50, 500),
    }
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    return this.constructor.render({
      ratingCount: data.good_ratings + data.ok_ratings + data.bad_ratings,
    })
  }
}

class GreasyForkGoodRatingCount extends BaseGreasyForkRating {
  static route = { base: 'greasyfork', pattern: 'good-rating-count/:scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ ratingCount: 17 }),
    },
  ]

  static render({ ratingCount }) {
    return {
      message: `${metric(ratingCount)} good`,
      color: 'green',
    }
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    return this.constructor.render({
      ratingCount: data.good_ratings,
    })
  }
}

class GreasyForkOkRatingCount extends BaseGreasyForkRating {
  static route = { base: 'greasyfork', pattern: 'ok-rating-count/:scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ ratingCount: 2 }),
    },
  ]

  static render({ ratingCount }) {
    return {
      message: `${metric(ratingCount)} ok`,
      color: 'yellow',
    }
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    return this.constructor.render({
      ratingCount: data.ok_ratings,
    })
  }
}

class GreasyForkBadRatingCount extends BaseGreasyForkRating {
  static route = { base: 'greasyfork', pattern: 'bad-rating-count/:scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ ratingCount: 3 }),
    },
  ]

  static render({ ratingCount }) {
    return {
      message: `${metric(ratingCount)} bad`,
      color: 'red',
    }
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    return this.constructor.render({
      ratingCount: data.bad_ratings,
    })
  }
}

export {
  GreasyForkRatingCount,
  GreasyForkGoodRatingCount,
  GreasyForkOkRatingCount,
  GreasyForkBadRatingCount,
}
