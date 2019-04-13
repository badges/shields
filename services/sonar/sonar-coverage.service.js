'use strict'

const { coveragePercentage } = require('../color-formatters')
const SonarBase = require('./sonar-base')
const {
  documentation,
  keywords,
  patternBase,
  queryParamSchema,
} = require('./sonar-helpers')

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

  static get examples() {
    return [
      {
        title: 'Sonar Coverage',
        namedParams: {
          protocol: 'http',
          host: 'sonar.petalslink.com',
          component: 'org.ow2.petals:petals-se-ase',
        },
        queryParams: {
          version: '4.2',
        },
        staticPreview: this.render({ coverage: 63 }),
        keywords,
        documentation,
      },
    ]
  }

  async handle({ protocol, host, component }, { sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      protocol,
      host,
      component,
      metricName: 'coverage',
    })
    const { metricValue: coverage } = this.transform({
      json,
      version: sonarVersion,
    })
    return this.constructor.render({ coverage })
  }
}
