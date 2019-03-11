'use strict'

const { colorScale } = require('../color-formatters')
const { patternBase, queryParamSchema, SonarBase } = require('./sonar-base')

// Tech Debt is bad, so lower value is better.
const ratingColorScale = colorScale(
  [10, 20, 50, 100],
  ['brightgreen', 'yellowgreen', 'yellow', 'orange', 'red']
)

module.exports = class SonarTechDebt extends SonarBase {
  static get category() {
    return 'analysis'
  }

  static get defaultBadgeData() {
    return { label: 'tech debt' }
  }

  static render({ debt, metric }) {
    return {
      label: SonarBase.getLabel({ metric }),
      message: `${debt}%`,
      color: ratingColorScale(debt),
    }
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: `${patternBase}/:metric(tech_debt|sqale_debt_ration)`,
      queryParamSchema,
    }
  }

  async handle({ protocol, host, buildType, metric }, { version }) {
    const json = await this.fetch({
      version,
      protocol,
      host,
      buildType,
      //special condition for backwards compatibility
      metricName: 'sqale_debt_ratio',
    })
    const { metricValue: debt } = this.transform({ json, version })
    return this.constructor.render({ debt, metric })
  }
}
