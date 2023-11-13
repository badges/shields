import Joi from 'joi'
import { floorCount } from '../color-formatters.js'
import { BaseJsonService, pathParams } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import { baseDescription } from './pub-common.js'

const description = `${baseDescription}
  <p>This badge shows a measure of quality. This includes several dimensions of quality such as code style, platform support, and maintainability.</p>`

const schema = Joi.object({
  grantedPoints: nonNegativeInteger,
  maxPoints: nonNegativeInteger,
}).required()

export default class PubPoints extends BaseJsonService {
  static category = 'rating'

  static route = { base: 'pub/points', pattern: ':packageName' }

  static openApi = {
    '/pub/points/{packageName}': {
      get: {
        summary: 'Pub Points',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'analysis_options',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'points' }

  static render({ grantedPoints, maxPoints }) {
    return {
      label: 'points',
      message: `${grantedPoints}/${maxPoints}`,
      color: floorCount((grantedPoints / maxPoints) * 100, 40, 60, 80),
    }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://pub.dev/api/packages/${packageName}/score`,
    })
  }

  async handle({ packageName }) {
    const score = await this.fetch({ packageName })
    const grantedPoints = score.grantedPoints
    const maxPoints = score.maxPoints
    return this.constructor.render({ grantedPoints, maxPoints })
  }
}
