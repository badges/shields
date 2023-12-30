import { floorCount } from '../color-formatters.js'
import { pathParams } from '../index.js'
import { starRating, metric } from '../text-formatters.js'
import { description, BaseWordpress } from './wordpress-base.js'

const extensionData = {
  plugin: {
    capt: 'Plugin',
    exampleSlug: 'bbpress',
  },
  theme: {
    capt: 'Theme',
    exampleSlug: 'twentyseventeen',
  },
}

class WordpressRatingBase extends BaseWordpress {
  static category = 'rating'

  static defaultBadgeData = { label: 'rating' }
}

function RatingForExtensionType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressRating extends WordpressRatingBase {
    static name = `Wordpress${capt}Rating`

    static route = {
      base: `wordpress/${extensionType}/rating`,
      pattern: ':slug',
    }

    static get openApi() {
      const key = `/wordpress/${extensionType}/rating/{slug}`
      const route = {}
      route[key] = {
        get: {
          summary: `WordPress ${capt} Rating`,
          description,
          parameters: pathParams({
            name: 'slug',
            example: exampleSlug,
          }),
        },
      }
      return route
    }

    static render({ rating, numRatings }) {
      const scaledAndRounded = ((rating / 100) * 5).toFixed(1)
      return {
        message: `${scaledAndRounded}/5 (${metric(numRatings)})`,
        color: floorCount(scaledAndRounded, 2, 3, 4),
      }
    }

    async handle({ slug }) {
      const { rating, num_ratings: numRatings } = await this.fetch({
        extensionType,
        slug,
      })
      return this.constructor.render({ rating, numRatings })
    }
  }
}

function StarsForExtensionType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressStars extends WordpressRatingBase {
    static name = `Wordpress${capt}Stars`

    static route = {
      base: `wordpress/${extensionType}`,
      pattern: '(stars|r)/:slug',
    }

    static get openApi() {
      const key = `/wordpress/${extensionType}/stars/{slug}`
      const route = {}
      route[key] = {
        get: {
          summary: `WordPress ${capt} Stars`,
          description,
          parameters: pathParams({
            name: 'slug',
            example: exampleSlug,
          }),
        },
      }
      return route
    }

    static render({ rating }) {
      const scaled = (rating / 100) * 5
      return { message: starRating(scaled), color: floorCount(scaled, 2, 3, 4) }
    }

    async handle({ slug }) {
      const { rating } = await this.fetch({
        extensionType,
        slug,
      })
      return this.constructor.render({ rating })
    }
  }
}

const ratingsServices = ['plugin', 'theme'].map(RatingForExtensionType)
const starsServices = ['plugin', 'theme'].map(StarsForExtensionType)
const modules = [...ratingsServices, ...starsServices]

export default modules
