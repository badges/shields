'use strict'

const Joi = require('joi')
const { starRating } = require('../text-formatters')
const { BaseJsonService } = require('..')

// https://api-docs.npms.io/#api-Package-GetPackageInfo
const numberSchema = Joi.number().min(0).max(1).required()
const responseSchema = Joi.object({
  score: Joi.object({
    final: numberSchema,
    detail: Joi.object({
      maintenance: numberSchema,
      popularity: numberSchema,
      quality: numberSchema,
    }),
  }),
}).required()

module.exports = class NpmsIO extends BaseJsonService {
  static category = 'analysis'

  static route = {
    base: 'npms-io',
    pattern:
      ':type(final|maintenance|popularity|quality)/:scope(@.+)?/:packageName',
  }

  static examples = [
    {
      title: 'npms.io',
      namedParams: { type: 'final', packageName: 'egg' },
      staticPreview: this.render({ score: 0.9711 }),
      keywords: ['node'],
    },
    {
      title: 'npms.io (popularity)',
      pattern: ':type/:scope/:packageName',
      namedParams: { type: 'popularity', scope: '@vue', packageName: 'cli' },
      staticPreview: this.render({ type: 'popularity', score: 0.89 }),
      keywords: ['node'],
    },
    {
      title: 'npms.io (quality)',
      namedParams: { type: 'quality', packageName: 'egg' },
      staticPreview: this.render({ type: 'quality', score: 0.98 }),
      keywords: ['node'],
    },
    {
      title: 'npms.io (maintenance)',
      namedParams: { type: 'maintenance', packageName: 'command' },
      staticPreview: this.render({ type: 'maintenance', score: 0.222 }),
      keywords: ['node'],
    },
  ]

  static defaultBadgeData = {
    label: 'rating',
  }

  static render({ type, score }) {
    return {
      label: type === 'final' ? 'rating' : type,
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

    const score = type === 'final' ? json.score.final : json.score.detail[type]

    return this.constructor.render({ type, score })
  }
}
