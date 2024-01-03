import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { coveragePercentage } from '../color-formatters.js'

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

const description =
  '[npms.io](https://npms.io) holds statistics for javascript packages.'

export default class NpmsIOScore extends BaseJsonService {
  static category = 'analysis'

  static route = {
    base: 'npms-io',
    pattern:
      ':type(final-score|maintenance-score|popularity-score|quality-score)/:scope(@.+)?/:packageName',
  }

  static openApi = {
    '/npms-io/{type}/{packageName}': {
      get: {
        summary: 'npms.io',
        description,
        parameters: pathParams(
          {
            name: 'type',
            schema: { type: 'string', enum: this.getEnum('type') },
            example: 'maintenance-score',
          },
          {
            name: 'packageName',
            example: 'command',
          },
        ),
      },
    },
    '/npms-io/{type}/{scope}/{packageName}': {
      get: {
        summary: 'npms.io (scoped package)',
        description,
        parameters: pathParams(
          {
            name: 'type',
            schema: { type: 'string', enum: this.getEnum('type') },
            example: 'maintenance-score',
          },
          {
            name: 'scope',
            example: '@vue',
          },
          {
            name: 'packageName',
            example: 'cli',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'score',
  }

  static render({ type, score }) {
    return {
      label: type === 'final' ? 'score' : type,
      message: `${(score * 100).toFixed(0)}%`,
      color: coveragePercentage(score * 100),
    }
  }

  async handle({ type, scope, packageName }) {
    const slug = scope ? `${scope}/${packageName}` : packageName
    const url = `https://api.npms.io/v2/package/${encodeURIComponent(slug)}`

    const json = await this._requestJson({
      schema: responseSchema,
      url,
      httpErrors: { 404: 'package not found or too new' },
    })

    const scoreType = type.slice(0, -6)
    const score =
      scoreType === 'final' ? json.score.final : json.score.detail[scoreType]

    return this.constructor.render({ type: scoreType, score })
  }
}
