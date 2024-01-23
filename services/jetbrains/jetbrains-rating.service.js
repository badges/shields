import Joi from 'joi'
import { starRating } from '../text-formatters.js'
import { colorScale } from '../color-formatters.js'
import { NotFound, pathParams } from '../index.js'
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
          }),
        )
        .single()
        .required(),
    }),
  }).required(),
}).required()

const jetbrainsSchema = Joi.object({
  votes: Joi.object()
    .pattern(Joi.string().required(), Joi.number().required())
    .required(),
  meanVotes: Joi.number().min(0).required(),
  meanRating: Joi.number().min(0).required(),
}).required()

export default class JetbrainsRating extends JetbrainsBase {
  static category = 'rating'

  static route = {
    base: 'jetbrains/plugin/r',
    pattern: ':format(rating|stars)/:pluginId',
  }

  static openApi = {
    '/jetbrains/plugin/r/{format}/{pluginId}': {
      get: {
        summary: 'JetBrains Plugin Rating',
        parameters: pathParams(
          {
            name: 'format',
            example: 'rating',
            schema: { type: 'string', enum: this.getEnum('format') },
          },
          {
            name: 'pluginId',
            example: '11941',
          },
        ),
      },
    },
  }

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
          pluginId,
        )}/rating`,
        httpErrors: { 400: 'not found' },
      })

      let voteSum = 0
      let voteCount = 0
      const votes = jetbrainsPluginData.votes
      Object.entries(votes).forEach(([rating, votes]) => {
        voteSum += parseInt(rating) * votes
        voteCount += votes
      })
      const meanRating = jetbrainsPluginData.meanRating

      if (voteCount === 0) {
        throw new NotFound({ prettyMessage: 'No Plugin Ratings' })
      }

      // JetBrains Plugin Rating Formula from:
      // https://plugins.jetbrains.com/docs/marketplace/plugins-rating.html
      rating = (voteSum + 2 * meanRating) / (voteCount + 2)
    }

    return this.constructor.render({ rating, format })
  }
}
