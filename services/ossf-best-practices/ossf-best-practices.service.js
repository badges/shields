import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { colorScale } from '../color-formatters.js'

const schema = Joi.object({
  badge_level: Joi.string()
    .valid('in_progress', 'passing', 'silver', 'gold')
    .required(),
  tiered_percentage: Joi.number().min(0).required(),
}).required()

const inProgressColorScale = colorScale(
  [25, 50, 75, 90],
  ['red', 'orange', 'yellow', 'yellowgreen', 'green']
)

const COLOR_SCALE = {
  in_progress: inProgressColorScale,
  passing: 'brightgreen',
  silver: 'silver',
  gold: 'gold',
}

export default class OSSFBestPractices extends BaseJsonService {
  static category = 'analysis'

  static route = { base: 'ossf-best-practices', pattern: ':projectId' }

  static examples = [
    {
      title: 'OSSF Best Practices',
      namedParams: {
        projectId: '6367',
      },
      staticPreview: this.render({
        badgeLevel: 'in_progress',
        tieredPercentage: 80,
      }),
      keywords: ['cii', 'bestpractices', 'security', 'supplychain'],
    },
  ]

  static defaultBadgeData = { label: 'best practices' }

  static render({ badgeLevel, tieredPercentage }) {
    const message =
      badgeLevel === 'in_progress'
        ? `in progress ${tieredPercentage}%`
        : badgeLevel
    const color =
      badgeLevel === 'in_progress'
        ? COLOR_SCALE[badgeLevel](tieredPercentage)
        : COLOR_SCALE[badgeLevel]
    return { message, color }
  }

  async fetch({ projectId }) {
    return this._requestJson({
      schema,
      url: `https://bestpractices.coreinfrastructure.org/projects/${projectId}/badge.json`,
      errorMessages: {
        404: 'not found',
      },
    })
  }

  async handle({ projectId }) {
    const { badge_level: badgeLevel, tiered_percentage: tieredPercentage } =
      await this.fetch({ projectId })
    return this.constructor.render({ badgeLevel, tieredPercentage })
  }
}
