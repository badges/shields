'use strict'

const BaseWordpress = require('./wordpress-base')
const { starRating, metric } = require('../../lib/text-formatters')
const { floorCount } = require('../../lib/color-formatters')

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
  static render({ response }) {
    const total = response.num_ratings
    const rating = ((response.rating / 100) * 5).toFixed(1)
    return {
      message: `${rating}/5 (${metric(total)})`,
      color: floorCount(rating, 2, 3, 4),
    }
  }

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
    static get route() {
      return {
        base: `wordpress/${extensionType}/rating`,
        pattern: ':slug',
      }
    }

    static get extensionType() {
      return extensionType
    }

    static get examples() {
      return [
        {
          title: `Wordpress ${capt} Rating`,
          exampleUrl: exampleSlug,
          pattern: ':slug',
          staticExample: this.render({
            response: {
              rating: 80,
              num_ratings: 100,
            },
          }),
          keywords: ['wordpress'],
        },
      ]
    }
  }
}

function StarsForExtensionType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressStars extends WordpressRatingBase {
    static render({ response }) {
      const rating = (response.rating / 100) * 5
      return { message: starRating(rating), color: floorCount(rating, 2, 3, 4) }
    }

    static get route() {
      return {
        base: `wordpress/${extensionType}`,
        format: '(?:stars|r)/(.+)',
        capture: ['slug'],
      }
    }

    static get extensionType() {
      return extensionType
    }

    static get examples() {
      return [
        {
          title: `Wordpress ${capt} Rating`,
          pattern: 'stars/:slug',
          namedParams: { slug: exampleSlug },
          staticExample: this.render({
            response: {
              rating: 80,
              num_ratings: 100,
            },
          }),
          keywords: ['wordpress'],
          documentation: 'There is an alias <code>/r/:slug.svg</code> as well.',
        },
      ]
    }
  }
}

const ratingsServices = ['plugin', 'theme'].map(RatingForExtensionType)
const starsServices = ['plugin', 'theme'].map(StarsForExtensionType)
const modules = [...ratingsServices, ...starsServices]

module.exports = modules
