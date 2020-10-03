'use strict'

const { coveragePercentage } = require('../color-formatters')
const SonarBase = require('./sonar-base')
const { documentation, keywords, queryParamSchema } = require('./sonar-helpers')

module.exports = class SonarCoverage extends SonarBase {
  static category = 'coverage'

  static route = {
    base: 'sonar/coverage',
    pattern: ':component',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Sonar Coverage',
      namedParams: {
        component: 'org.ow2.petals:petals-se-ase',
      },
      queryParams: {
        server: 'http://sonar.petalslink.com',
        sonarVersion: '4.2',
      },
      staticPreview: this.render({ coverage: 63 }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'coverage' }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  async handle({ component }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      metricName: 'coverage',
    })
    const { coverage } = this.transform({
      json,
      sonarVersion,
    })
    return this.constructor.render({ coverage })
  }
}
