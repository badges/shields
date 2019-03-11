'use strict'

const { coveragePercentage } = require('../color-formatters')
const { patternBase, queryParamSchema, SonarBase } = require('./sonar-base')

module.exports = class SonarCoverage extends SonarBase {
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
    const json = await this.fetch({
      version,
      protocol,
      host,
      buildType,
      metricName: 'coverage',
    })
    const { metricValue: coverage } = this.transform({ json, version })
    return this.constructor.render({ coverage })
  }
}
