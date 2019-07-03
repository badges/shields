'use strict'

const { starRating, metric } = require('../text-formatters')
const { floorCount } = require('../color-formatters')
const BaseWordpress = require('./wordpress-base')

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
  static get category() {
    return 'rating'
  }

  static get defaultBadgeData() {
    return { label: 'rating' }
  }
}

function RatingForExtensionType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressRating extends WordpressRatingBase {
    static get name() {
      return `Wordpress${capt}Rating`
    }

    static get route() {
      return {
        base: `wordpress/${extensionType}/rating`,
        pattern: ':slug',
      }
    }

    static get examples() {
      return [
        {
          title: `WordPress ${capt} Rating`,
          namedParams: { slug: exampleSlug },
          staticPreview: this.render({
            rating: 80,
            numRatings: 100,
          }),
        },
      ]
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
    static get name() {
      return `Wordpress${capt}Stars`
    }

    static get route() {
      return {
        base: `wordpress/${extensionType}`,
        pattern: '(stars|r)/:slug',
      }
    }

    static get examples() {
      return [
        {
          title: `WordPress ${capt} Rating`,
          pattern: 'stars/:slug',
          namedParams: { slug: exampleSlug },
          staticPreview: this.render({
            rating: 80,
          }),
          documentation: 'There is an alias <code>/r/:slug.svg</code> as well.',
        },
      ]
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

module.exports = modules
