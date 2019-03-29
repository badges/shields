'use strict'

const SonarBase = require('./sonar-base')
const { patternBase, queryParamSchema } = require('./sonar-helpers')

module.exports = class SonarQualityGate extends SonarBase {
  static get category() {
    return 'analysis'
  }

  static get defaultBadgeData() {
    return { label: 'quality gate' }
  }

  static render({ qualityState }) {
    if (qualityState === 'OK') {
      return {
        message: 'passed',
        color: 'success',
      }
    }
    return {
      message: 'failed',
      color: 'critical',
    }
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: `${patternBase}/:metric(quality_gate|alert_status)`,
      queryParamSchema,
    }
  }

  async handle({ protocol, host, component }, { version }) {
    const json = await this.fetch({
      version,
      protocol,
      host,
      component,
      metricName: 'alert_status',
    })
    const { metricValue: qualityState } = this.transform({ json, version })
    return this.constructor.render({ qualityState })
  }
}
