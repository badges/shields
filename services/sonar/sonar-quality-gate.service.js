'use strict'

const SonarBase = require('./sonar-base')
const { documentation, keywords, queryParamSchema } = require('./sonar-helpers')

module.exports = class SonarQualityGate extends SonarBase {
  static category = 'analysis'

  static route = {
    base: 'sonar',
    pattern: ':metric(quality_gate|alert_status)/:component',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Sonar Quality Gate',
      namedParams: {
        component: 'swellaby:azdo-shellcheck',
        metric: 'quality_gate',
      },
      queryParams: {
        server: 'https://sonarcloud.io',
        sonarVersion: '4.2',
      },
      staticPreview: this.render({ qualityState: 'OK' }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'quality gate' }

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

  async handle({ component }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      metricName: 'alert_status',
    })
    const { alert_status: qualityState } = this.transform({
      json,
      sonarVersion,
    })
    return this.constructor.render({ qualityState })
  }
}
