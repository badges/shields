import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { colorScale } from '../color-formatters.js'

const schema = Joi.object({
  score: Joi.number().required(),
})

export default class DubScore extends BaseJsonService {
  static category = 'rating'

  static route = { base: 'dub/score', pattern: ':packageName' }

  static openApi = {
    '/dub/score/{packageName}': {
      get: {
        summary: 'DUB Score',
        parameters: pathParams({
          name: 'packageName',
          example: 'vibe-d',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'score' }

  static render({ score }) {
    return {
      label: 'score',
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
