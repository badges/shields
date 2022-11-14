import Joi from 'joi'
import { floorCount } from '../color-formatters.js'
import { BaseJsonService } from '../index.js'
import { nonNegativeInteger } from '../validators.js'

const documentation =
  '<p>A measure of quality. This includes several dimensions of quality such as code style, platform support, and maintainability.</p>'

const keywords = ['dart', 'flutter']

const schema = Joi.object({
  grantedPoints: nonNegativeInteger,
  maxPoints: nonNegativeInteger,
}).required()

const title = 'Pub Points'

export default class PubPoints extends BaseJsonService {
  static category = 'rating'

  static route = { base: 'pub/points', pattern: ':packageName' }

  static examples = [
    {
      title,
      keywords,
      documentation,
      namedParams: { packageName: 'analysis_options' },
      staticPreview: this.render({ grantedPoints: 120, maxPoints: 140 }),
    },
  ]

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
