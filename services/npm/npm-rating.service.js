'use strict'

const Joi = require('joi')
const { starRating } = require('../text-formatters')
const { BaseJsonService } = require('..')

// https://api-docs.npms.io/#api-Package-GetPackageInfo
const responseSchema = Joi.object({
  score: Joi.object({
    final: Joi.number().required(),
    detail: Joi.object({
      maintenance: Joi.number().required(),
      popularity: Joi.number().required(),
      quality: Joi.number().required(),
    }),
  }),
}).required()

module.exports = class NpmRating extends BaseJsonService {
  static category = 'rating'

  static route = {
    base: 'npm',
    pattern:
      'rating/:type(maintenance|popularity|quality)?/:scope(@.+)?/:packageName',
  }

  static examples = [
    {
      title: 'NPM Rating',
      namedParams: { packageName: 'egg' },
      staticPreview: this.render({ score: 0.9711 }),
      keywords: ['node'],
    },
    {
      title: 'NPM Rating (Popularity)',
      namedParams: { type: 'popularity', packageName: '@vue/cli' },
      staticPreview: this.render({ type: 'popularity', score: 0.89 }),
      keywords: ['node'],
    },
    {
      title: 'NPM Rating (Quality)',
      namedParams: { type: 'quality', packageName: 'egg' },
      staticPreview: this.render({ type: 'quality', score: 0.98 }),
      keywords: ['node'],
    },
    {
      title: 'NPM Rating (Maintenance)',
      namedParams: { type: 'maintenance', packageName: 'command' },
      staticPreview: this.render({ type: 'maintenance', score: 0.222 }),
      keywords: ['node'],
    },
  ]

  static defaultBadgeData = {
    label: 'Rating',
  }

  static render({ type, score }) {
    return {
      label: !type ? 'Rating' : type[0].toUpperCase() + type.substring(1),
      message: starRating(score * 5),
      color: score > 0.3 ? 'brightgreen' : 'red',
    }
  }

  async handle({ type, scope, packageName }) {
    const slug = scope ? `${scope}/${packageName}` : packageName
    const url = `https://api.npms.io/v2/package/${encodeURIComponent(slug)}`

    const json = await this._requestJson({
      schema: responseSchema,
      url,
      errorMessages: { 404: 'package not found or too new' },
    })

    let score = json.score.final
    if (type) score = json.score.detail[type]

    return this.constructor.render({ type, score })
  }
}
