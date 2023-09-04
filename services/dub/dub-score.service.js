import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { colorScale } from '../color-formatters.js'

const schema = Joi.object({
  score: Joi.number().required(),
})

export default class DubScore extends BaseJsonService {
  static category = 'rating'

  static route = { base: 'dub/score', pattern: ':packageName' }

  static examples = [
    {
      title: 'DUB SCORE',
      namedParams: { packageName: 'vibe-d' },
      staticPreview: this.render({ score: 4.5 }),
    },
  ]

  static defaultBadgeData = { label: 'SCORE' }

  static render({ score }) {
    return {
      label: 'SCORE',
      color: colorScale([1, 2, 3, 4, 5])(score),
      message: score,
    }
  }

  async fetch({ packageName }) {
    const url = `https://code.dlang.org/api/packages/${packageName}/stats`
    return this._requestJson({ schema, url })
  }

  async handle({ packageName }) {
    let { score } = await this.fetch({ packageName })
    score = score.toFixed(1)
    return this.constructor.render({ score })
  }
}
