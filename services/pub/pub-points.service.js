import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const documentation = `<p>A measure of quality. This includes several dimensions of quality such as code style, platform support, and maintainability.</p>`

const keywords = ['dart', 'flutter']

const schema = Joi.object({
  grantedPoints: Joi.number().min(0).max(130).required(),
  maxPoints: Joi.number().min(130).max(130).required(),
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
      staticPreview: {
        label: 'points',
        message: '130/130',
        color: 'brightgreen',
      },
    },
  ]

  static defaultBadgeData = { label: 'points' }

  static render({ grantedPoints, maxPoints, packageName }) {
    return {
      label: 'points',
      message: `${grantedPoints}/${maxPoints}`,
      color: 'brightgreen',
      link: `https://pub.dev/packages/${packageName}`,
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
    return this.constructor.render({ grantedPoints, maxPoints, packageName })
  }
}
