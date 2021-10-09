import Joi from 'joi'
import {
  nonNegativeInteger,
  optionalNonNegativeInteger,
} from '../validators.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { BaseJsonService, NotFound } from '../index.js'

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
export default class ClearlyDefinedService extends BaseJsonService {
  static category = 'analysis'
  static route = {
    base: 'clearlydefined',
    pattern: 'score/:type/:provider/:namespace/:name/:revision',
  }

  static examples = [
    {
      title: 'ClearlyDefined Score',
      namedParams: {
        type: 'npm',
        provider: 'npmjs',
        namespace: '-',
        name: 'jquery',
        revision: '3.4.1',
      },
      staticPreview: this.render({ score: 88 }),
    },
  ]

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
    return this._requestJson({
      schema,
      url: `https://api.clearlydefined.io/definitions/${type}/${provider}/${namespace}/${name}/${revision}`,
      errorMessages: {
        500: 'unknown type, provider, or upstream issue',
      },
    })
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
