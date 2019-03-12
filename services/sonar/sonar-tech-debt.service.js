'use strict'

const SonarBase = require('./sonar-base')
const {
  patternBase,
  queryParamSchema,
  getLabel,
  badMetricColorScale,
} = require('./sonar-helpers')

module.exports = class SonarTechDebt extends SonarBase {
  static get category() {
    return 'analysis'
  }

  static get defaultBadgeData() {
    return { label: 'tech debt' }
  }

  static render({ debt, metric }) {
    return {
      label: getLabel({ metric }),
      message: `${debt}%`,
      color: badMetricColorScale(debt),
    }
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: `${patternBase}/:metric(tech_debt|sqale_debt_ration)`,
      queryParamSchema,
    }
  }

  async handle({ protocol, host, component, metric }, { version }) {
    const json = await this.fetch({
      version,
      protocol,
      host,
      component,
      //special condition for backwards compatibility
      metricName: 'sqale_debt_ratio',
    })
    const { metricValue: debt } = this.transform({ json, version })
    return this.constructor.render({ debt, metric })
  }
}
