'use strict'

const Joi = require('@hapi/joi')
const { starRating } = require('../text-formatters')
const { colorScale } = require('../color-formatters')
const JetbrainsBase = require('./jetbrains-base')

const pluginRatingColor = colorScale([2, 3, 4])

const schema = Joi.object({
  'plugin-repository': Joi.object({
    category: Joi.object({
      'idea-plugin': Joi.array()
        .min(1)
        .items(
          Joi.object({
            rating: Joi.string().required(),
          })
        )
        .single()
        .required(),
    }),
  }).required(),
}).required()

module.exports = class JetbrainsRating extends JetbrainsBase {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'jetbrains/plugin/r',
      pattern: ':format(rating|stars)/:pluginId',
    }
  }

  static get examples() {
    return [
      {
        title: 'JetBrains IntelliJ Plugins',
        pattern: 'rating/:pluginId',
        namedParams: {
          pluginId: '11941-automatic-power-saver',
        },
        staticPreview: this.render({
          rating: '4.5',
          format: 'rating',
        }),
      },
      {
        title: 'JetBrains IntelliJ Plugins',
        pattern: 'stars/:pluginId',
        namedParams: {
          pluginId: '11941-automatic-power-saver',
        },
        staticPreview: this.render({
          rating: '4.5',
          format: 'stars',
        }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'rating' }
  }

  static render({ rating, format }) {
    const message =
      format === 'rating'
        ? `${+parseFloat(rating).toFixed(1)}/5`
        : starRating(rating)
    return {
      message,
      color: pluginRatingColor(rating),
    }
  }

  async handle({ format, pluginId }) {
    const pluginData = await this.fetchPackageData({ pluginId, schema })
    const pluginRating =
      pluginData['plugin-repository'].category['idea-plugin'][0].rating
    return this.constructor.render({ rating: pluginRating, format })
  }
}
