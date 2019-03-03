'use strict'

const { coveragePercentage } = require('../color-formatters')
const {
  patternBase,
  queryParamSchema,
  SonarQubeBase,
} = require('./sonarqube-base')

module.exports = class SonarQubeCoverage extends SonarQubeBase {
  static get category() {
    return 'coverage'
  }

  static get defaultBadgeData() {
    return { label: 'coverage' }
  }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: `${patternBase}/coverage`,
      queryParamSchema,
    }
  }

  async handle({ protocol, host, buildType }, { version }) {
    const useLegacyApi = this.useLegacyApi({ version })
    const json = await this.fetch({
      useLegacyApi,
      protocol,
      host,
      buildType,
      metricName: 'coverage',
    })
    const { metricValue: coverage } = this.transform({ json, useLegacyApi })
    return this.constructor.render({ coverage })
  }
}
