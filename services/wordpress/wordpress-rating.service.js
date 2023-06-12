import { starRating, metric } from '../text-formatters.js'
import { floorCount } from '../color-formatters.js'
import { documentation, BaseWordpress } from './wordpress-base.js'

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

    static examples = [
      {
        title: `WordPress ${capt} Rating`,
        namedParams: { slug: exampleSlug },
        staticPreview: this.render({
          rating: 80,
          numRatings: 100,
        }),
        documentation,
      },
    ]

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

    static examples = [
      {
        title: `WordPress ${capt} Rating`,
        pattern: 'stars/:slug',
        namedParams: { slug: exampleSlug },
        staticPreview: this.render({
          rating: 80,
        }),
        documentation,
      },
    ]

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
