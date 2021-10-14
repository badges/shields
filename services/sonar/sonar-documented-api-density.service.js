import SonarBase from './sonar-base.js'
import {
  queryParamSchema,
  getLabel,
  positiveMetricColorScale,
  keywords,
  documentation,
} from './sonar-helpers.js'

const metric = 'public_documented_api_density'

export default class SonarDocumentedApiDensity extends SonarBase {
  static category = 'analysis'

  static route = {
    base: `sonar/${metric}`,
    pattern: ':component/:branch*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Sonar Documented API Density',
      namedParams: {
        component: 'org.ow2.petals:petals-se-ase',
        branch: 'master',
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

  async handle({ component, branch }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      branch,
      metricName: metric,
    })
    const metrics = this.transform({ json, sonarVersion })
    return this.constructor.render({ density: metrics[metric] })
  }
}
