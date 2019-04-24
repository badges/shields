'use strict'

const SonarBase = require('./sonar-base')
const {
  documentation,
  keywords,
  patternBase,
  queryParamSchema,
} = require('./sonar-helpers')

module.exports = class SonarQualityGate extends SonarBase {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: `${patternBase}/:metric(quality_gate|alert_status)`,
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Sonar Quality Gate',
        namedParams: {
          protocol: 'https',
          host: 'sonarcloud.io',
          component: 'swellaby:azdo-shellcheck',
          metric: 'quality_gate',
        },
        queryParams: {
          sonarVersion: '4.2',
        },
        staticPreview: this.render({ qualityState: 'OK' }),
        keywords,
        documentation,
      },
    ]
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

  async handle({ protocol, host, component }, { sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      protocol,
      host,
      component,
      metricName: 'alert_status',
    })
    const { metricValue: qualityState } = this.transform({ json, sonarVersion })
    return this.constructor.render({ qualityState })
  }
}
