import Joi from 'joi'
import {
  nonNegativeInteger,
  optionalNonNegativeInteger,
} from '../validators.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { BaseService, NotFound, pathParams } from '../index.js'
import { parseJson } from '../../core/base-service/json.js'

const schema = Joi.object({
  scores: Joi.object({
    effective: nonNegativeInteger,
  }).required(),
  described: Joi.object({
    files: optionalNonNegativeInteger,
  }),
}).required()

// This service based on the REST API for clearlydefined.io
// https://api.clearlydefined.io/api-docs/
export default class ClearlyDefinedService extends BaseService {
  static category = 'analysis'
  static route = {
    base: 'clearlydefined',
    pattern: 'score/:type/:provider/:namespace/:name/:revision',
  }

  static openApi = {
    '/clearlydefined/score/{type}/{provider}/{namespace}/{name}/{revision}': {
      get: {
        summary: 'ClearlyDefined Score',
        parameters: pathParams(
          {
            name: 'type',
            example: 'npm',
          },
          {
            name: 'provider',
            example: 'npmjs',
          },
          {
            name: 'namespace',
            example: '-',
          },
          {
            name: 'name',
            example: 'jquery',
          },
          {
            name: 'revision',
            example: '3.4.1',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'score' }

  static render({ score }) {
    score = Math.round(score)
    return {
      label: 'score',
      message: `${score}/100`,
      color: floorCountColor(score, 40, 60, 100),
    }
  }

  async fetch({ type, provider, namespace, name, revision }) {
    const { buffer } = await this._request({
      url: `https://api.clearlydefined.io/definitions/${type}/${provider}/${namespace}/${name}/${revision}`,
      options: { headers: { Accept: 'application/json' } },
    })
    // If the type or provider is not found, the API returns a 200 response
    // with an empty body. It cannot be parsed as JSON, we need to handle this
    // case earlier than in the usual BaseJsonService._requestJson flow.
    if (buffer.length === 0) {
      throw new NotFound({
        prettyMessage: 'unknown type, provider, or upstream issue',
      })
    }
    const json = parseJson(buffer)
    return this.constructor._validate(json, schema)
  }

  async handle({ type, provider, namespace, name, revision }) {
    const data = await this.fetch({ type, provider, namespace, name, revision })
    // Return score only if definition contains some files,
    // else it was an incomplete response due to unknown coordinates
    if (data.described.files > 0) {
      return this.constructor.render({ score: data.scores.effective })
    } else {
      throw new NotFound({
        prettyMessage: 'unknown namespace, name, or revision',
      })
    }
  }
}
