import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { coveragePercentage } from '../color-formatters.js'

const numberSchema = Joi.number().min(0).max(1).required()
const scoreSchema = Joi.object({ score: numberSchema })
const responseSchema = Joi.object({
  score: Joi.object({
    supplyChainRisk: scoreSchema,
    quality: scoreSchema,
    maintenance: scoreSchema,
    vulnerability: scoreSchema,
    license: scoreSchema,
  }),
}).required()

const keywords = ['node', 'npm score']

export default class SocketDevScore extends BaseJsonService {
  static category = 'analysis'

  static route = {
    base: 'socket-dev',
    pattern:
      ':type(supplyChainRisk|quality|maintenance|vulnerability|license)-score/:packageManager(npm)/:scope(@.+)?/:packageName',
  }

  static examples = [
    {
      title: 'socket.dev (supply chain risk)',
      namedParams: {
        type: 'supplyChainRisk',
        packageManager: 'npm',
        packageName: 'fetch-cookie',
      },
      staticPreview: this.render({ type: 'supplyChainRisk', score: 0.99 }),
      keywords,
    },
    {
      title: 'socket.dev (quality)',
      namedParams: {
        type: 'quality',
        packageManager: 'npm',
        packageName: 'fetch-cookie',
      },
      staticPreview: this.render({ type: 'quality', score: 0.9746 }),
      keywords,
    },
    {
      title: 'socket.dev (maintenance)',
      namedParams: {
        type: 'maintenance',
        packageManager: 'npm',
        packageName: 'fetch-cookie',
      },
      staticPreview: this.render({ type: 'maintenance', score: 0.8571 }),
      keywords,
    },
    {
      title: 'socket.dev (vulnerability)',
      namedParams: {
        type: 'vulnerability',
        packageManager: 'npm',
        packageName: 'fetch-cookie',
      },
      staticPreview: this.render({ type: 'vulnerability', score: 1 }),
      keywords,
    },
    {
      title: 'socket.dev (license)',
      namedParams: {
        type: 'license',
        packageManager: 'npm',
        packageName: 'fetch-cookie',
      },
      staticPreview: this.render({ type: 'license', score: 0.8714 }),
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'socket score',
  }

  static render({ type, score }) {
    return {
      label:
        type === 'supplyChainRisk' ? 'socket score' : `socket score (${type})`,
      message: `${(score * 100).toFixed(0)}%`,
      color: coveragePercentage(score * 100),
    }
  }

  async handle({ type, packageManager, scope, packageName }) {
    const slug = scope ? `${scope}/${packageName}` : packageName
    const url = `https://socket.dev/api/${encodeURIComponent(
      packageManager
    )}/package-info/score?name=${encodeURIComponent(slug)}`

    const json = await this._requestJson({
      schema: responseSchema,
      url,
      errorMessages: {
        404: 'package not found or too new',
        500: 'package not found or too new',
      },
    })

    const { score } = json.score[type]

    return this.constructor.render({ type, score })
  }
}
