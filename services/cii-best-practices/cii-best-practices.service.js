import Joi from 'joi'
import { colorScale, coveragePercentage } from '../color-formatters.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  badge_level: Joi.string().required(),
  tiered_percentage: Joi.number().required(),
}).required()

const keywords = ['core infrastructure initiative']

const summaryColorScale = colorScale(
  [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300],
  [
    'brightred',
    '#C45A1D',
    '#C4601D',
    '#B86C11',
    '#C47E1D',
    '#C4881D',
    '#C4941D',
    '#C4A41D',
    '#B9A612',
    '#C4C21D',
    'brightgreen',
    '#BBBBBB',
    '#E9C504',
  ]
)

export default class CIIBestPracticesService extends BaseJsonService {
  static category = 'analysis'
  static route = {
    base: 'cii',
    pattern: ':metric(level|percentage|summary)/:projectId',
  }

  static exampless = [
    {
      title: 'CII Best Practices Level',
      pattern: 'level/:projectId',
      namedParams: {
        projectId: '1',
      },
      staticPreview: this.renderLevelBadge({ level: 'gold' }),
      keywords,
    },
    {
      title: 'CII Best Practices Tiered Percentage',
      pattern: 'percentage/:projectId',
      namedParams: {
        projectId: '29',
      },
      staticPreview: this.renderTieredPercentageBadge({ percentage: 107 }),
      keywords,
    },
    {
      title: 'CII Best Practices Summary',
      pattern: 'summary/:projectId',
      namedParams: {
        projectId: '33',
      },
      staticPreview: this.renderSummaryBadge({ percentage: 94 }),
      keywords,
      documentation:
        'This badge uses the same message and color scale as the native CII one, but with all the configuration and goodness that Shields provides!',
    },
  ]

  static defaultBadgeData = { label: 'cii' }

  static renderLevelBadge({ level }) {
    let message = level
    let color
    if (level === 'in_progress') {
      color = 'orange'
      message = 'in progress'
    } else if (level === 'passing') {
      color = 'brightgreen'
    } else if (level === 'silver') {
      color = '#BBBBBB'
    } else {
      color = '#E9C504'
    }
    return { message, color }
  }

  static renderTieredPercentageBadge({ percentage }) {
    return {
      message: `${percentage.toFixed(0)}%`,
      color: coveragePercentage(percentage),
    }
  }

  static renderSummaryBadge({ percentage }) {
    let message
    if (percentage < 100) {
      message = `in progress ${percentage}%`
    } else if (percentage < 200) {
      message = 'passing'
    } else if (percentage < 300) {
      message = 'silver'
    } else {
      message = 'gold'
    }
    return {
      message,
      color: summaryColorScale(percentage),
    }
  }

  async handle({ metric, projectId }) {
    // No official API documentation is available.
    const { badge_level: level, tiered_percentage: percentage } =
      await this._requestJson({
        schema,
        url: `https://bestpractices.coreinfrastructure.org/projects/${projectId}/badge.json`,
        errorMessages: {
          404: 'project not found',
        },
      })

    if (metric === 'level') {
      return this.constructor.renderLevelBadge({ level })
    } else if (metric === 'percentage') {
      return this.constructor.renderTieredPercentageBadge({ percentage })
    } else {
      return this.constructor.renderSummaryBadge({ percentage })
    }
  }
}
