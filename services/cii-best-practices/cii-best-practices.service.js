'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const {
  colorScale,
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

const ciiBestPracticesSchema = Joi.object({
  badge_level: Joi.string().required(),
  tiered_percentage: Joi.number().required(),
}).required()

const keywords = ['cii', 'cii best practices', 'core infrastructure initiative']

module.exports = class CIIBestPracticesService extends BaseJsonService {
  static render({ label, message, color }) {
    return {
      label,
      message,
      color,
    }
  }

  static get defaultBadgeData() {
    return { color: 'blue', label: 'cii' }
  }

  static get category() {
    return 'other'
  }

  static get examples() {
    return [
      {
        title: 'CII Best Practices Level',
        namedParams: {
          metric: 'level',
          projectId: '1',
        },
        pattern: 'level/:projectId',
        staticExample: this.render({
          label: 'cii',
          message: 'gold',
          color: '#E9C504',
        }),
        keywords,
      },
      {
        title: 'CII Best Practices Tiered Percentage',
        namedParams: {
          metric: 'percentage',
          projectId: '29',
        },
        pattern: 'percentage/:projectId',
        staticExample: this.render({
          label: 'cii',
          message: '107%',
          color: 'brightgreen',
        }),
        keywords,
      },
      {
        title: 'CII Best Practices Default',
        namedParams: {
          metric: 'default',
          projectId: '33',
        },
        pattern: 'default/:projectId',
        staticExample: this.render({
          label: 'cii',
          message: 'in progress 94%',
          color: '#C4C21D',
        }),
        keywords,
      },
    ]
  }

  static get route() {
    return {
      base: 'cii',
      pattern: ':metric(level|percentage|default)/:projectId',
    }
  }

  buildLevelBadge(level) {
    let color
    let message = level
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
    return this.constructor.render({ message, color })
  }

  buildTieredPercentageBadge(percentage) {
    const color = coveragePercentageColor(percentage)
    const message = `${percentage.toFixed(0)}%`
    return this.constructor.render({ message, color })
  }

  buildDefaultBadge(percentage) {
    let message
    const steps = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300]
    const colors = [
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
    const color = colorScale(steps, colors)(percentage)

    if (percentage < 100) {
      message = `in progress ${percentage}%`
    } else if (percentage < 200) {
      message = 'passing'
    } else if (percentage < 300) {
      message = 'silver'
    } else {
      message = 'gold'
    }

    return this.constructor.render({ message, color })
  }

  async handle({ metric, projectId }) {
    // No official API documentation available
    const url = `https://bestpractices.coreinfrastructure.org/projects/${projectId}/badge.json`
    const json = await this._requestJson({
      schema: ciiBestPracticesSchema,
      url,
      errorMessages: {
        404: 'project not found',
      },
    })

    if (metric === 'level') {
      return this.buildLevelBadge(json.badge_level)
    } else if (metric === 'percentage') {
      return this.buildTieredPercentageBadge(json.tiered_percentage)
    } else {
      return this.buildDefaultBadge(json.tiered_percentage)
    }
  }
}
