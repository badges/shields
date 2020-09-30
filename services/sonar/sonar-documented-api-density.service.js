'use strict'

const SonarBase = require('./sonar-base')
const {
  queryParamSchema,
  getLabel,
  positiveMetricColorScale,
  keywords,
  documentation,
} = require('./sonar-helpers')

const metric = 'public_documented_api_density'

module.exports = class SonarDocumentedApiDensity extends SonarBase {
  static category = 'analysis'

  static route = {
    base: `sonar/${metric}`,
    pattern: ':component',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Sonar Documented API Density',
      namedParams: {
        component: 'org.ow2.petals:petals-se-ase',
      },
      queryParams: {
        server: 'http://sonar.petalslink.com',
        sonarVersion: '4.2',
      },
      staticPreview: this.render({ density: 82 }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = { label: getLabel({ metric }) }

  static render({ density }) {
    return {
      message: `${density}%`,
      color: positiveMetricColorScale(density),
    }
  }

  async handle({ component }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      metricName: metric,
    })
    const metrics = this.transform({ json, sonarVersion })
    return this.constructor.render({ density: metrics[metric] })
  }
}
