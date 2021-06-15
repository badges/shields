'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { starRating } = require('../text-formatters')

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

const queryParamSchema = Joi.object({
  msg_type: Joi.string().pattern(/percentage|star|grade/),
}).default('percentage')

function formatMessage(score, msgType) {
  switch (msgType) {
    case 'star': {
      return starRating(score * 5)
    }
    case 'grade': {
      if (score >= 0.95) return 'A+'
      if (score >= 0.75) return 'A'
      if (score >= 0.5) return 'B'
      if (score >= 0.25) return 'C'
      if (score >= 0.05) return 'D'
      return 'E'
    }
    case 'percentage':
    default: {
      return `${(score * 100).toFixed(1)}%`
    }
  }
}

module.exports = class NpmsIO extends BaseJsonService {
  static category = 'analysis'

  static route = {
    base: 'npms-io',
    pattern:
      ':type(rating|maintenance|popularity|quality)/:scope(@.+)?/:packageName',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'npms.io',
      namedParams: { type: 'rating', packageName: 'egg' },
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
    {
      title: 'npms.io with percentage style',
      namedParams: { type: 'rating', packageName: 'egg' },
      queryParams: { msg_type: 'percentage' },
      staticPreview: this.render({ score: 0.9711 }),
      keywords: ['node'],
    },
    {
      title: 'npms.io with grade style',
      namedParams: { type: 'rating', packageName: 'egg' },
      queryParams: { msg_type: 'grade' },
      staticPreview: this.render({ score: 0.9711 }),
      keywords: ['node'],
    },
    {
      title: 'npms.io with star style)',
      namedParams: { type: 'rating', packageName: 'egg' },
      queryParams: { msg_type: 'star' },
      staticPreview: this.render({ score: 0.9711 }),
      keywords: ['node'],
    },
  ]

  static defaultBadgeData = {
    label: 'rating',
  }

  static render({ type, score, msgType }) {
    return {
      label: type === 'rating' ? 'rating' : type,
      message: formatMessage(score, msgType),
      color: score > 0.3 ? 'brightgreen' : 'red',
    }
  }

  async handle({ type, scope, packageName }, { msg_type: msgType }) {
    const slug = scope ? `${scope}/${packageName}` : packageName
    const url = `https://api.npms.io/v2/package/${encodeURIComponent(slug)}`

    const json = await this._requestJson({
      schema: responseSchema,
      url,
      errorMessages: { 404: 'package not found or too new' },
    })

    const score = type === 'rating' ? json.score.final : json.score.detail[type]

    return this.constructor.render({ type, score, msgType })
  }
}
