import SonarBase from './sonar-base.js'
import {
  negativeMetricColorScale,
  getLabel,
  documentation,
  keywords,
  queryParamSchema,
} from './sonar-helpers.js'

export default class SonarTechDebt extends SonarBase {
  static category = 'analysis'

  static route = {
    base: 'sonar',
    pattern: ':metric(tech_debt|sqale_debt_ratio)/:component/:branch*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Sonar Tech Debt',
      namedParams: {
        component: 'org.ow2.petals:petals-se-ase',
        metric: 'tech_debt',
        branch: 'master',
      },
      queryParams: {
        server: 'http://sonar.petalslink.com',
        sonarVersion: '4.2',
      },
      staticPreview: this.render({
        debt: 1,
        metric: 'tech_debt',
      }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'tech debt' }

  static render({ debt, metric }) {
    return {
      label: getLabel({ metric }),
      message: `${debt}%`,
      color: negativeMetricColorScale(debt),
    }
  }

  async handle({ component, metric, branch }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      branch,
      // Special condition for backwards compatibility.
      metricName: 'sqale_debt_ratio',
    })
    const { sqale_debt_ratio: debt } = this.transform({ json, sonarVersion })
    return this.constructor.render({ debt, metric })
  }
}
