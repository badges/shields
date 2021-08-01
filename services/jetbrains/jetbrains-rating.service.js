import Joi from 'joi'
import { starRating } from '../text-formatters.js'
import { colorScale } from '../color-formatters.js'
import JetbrainsBase from './jetbrains-base.js'

const pluginRatingColor = colorScale([2, 3, 4])

const intelliJschema = Joi.object({
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

const jetbrainsSchema = Joi.object({
  meanRating: Joi.number().min(0).required(),
}).required()

export default class JetbrainsRating extends JetbrainsBase {
  static category = 'rating'

  static route = {
    base: 'jetbrains/plugin/r',
    pattern: ':format(rating|stars)/:pluginId',
  }

  static examples = [
    {
      title: 'JetBrains Plugins',
      pattern: 'rating/:pluginId',
      namedParams: {
        pluginId: '11941',
      },
      staticPreview: this.render({
        rating: '4.5',
        format: 'rating',
      }),
    },
    {
      title: 'JetBrains Plugins',
      pattern: 'stars/:pluginId',
      namedParams: {
        pluginId: '11941',
      },
      staticPreview: this.render({
        rating: '4.5',
        format: 'stars',
      }),
    },
  ]

  static defaultBadgeData = { label: 'rating' }

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
    let rating
    if (this.constructor._isLegacyPluginId(pluginId)) {
      const intelliJPluginData = await this.fetchIntelliJPluginData({
        pluginId,
        schema: intelliJschema,
      })
      rating =
        intelliJPluginData['plugin-repository'].category['idea-plugin'][0]
          .rating
    } else {
      const jetbrainsPluginData = await this._requestJson({
        schema: jetbrainsSchema,
        url: `https://plugins.jetbrains.com/api/plugins/${this.constructor._cleanPluginId(
          pluginId
        )}/rating`,
        errorMessages: { 400: 'not found' },
      })
      rating = jetbrainsPluginData.meanRating
    }

    return this.constructor.render({ rating, format })
  }
}
