import { pathParam } from '../index.js'
import SonarBase from './sonar-base.js'
import {
  negativeMetricColorScale,
  getLabel,
  documentation,
  queryParamSchema,
  openApiQueryParams,
} from './sonar-helpers.js'

export default class SonarTechDebt extends SonarBase {
  static category = 'analysis'

  static route = {
    base: 'sonar',
    pattern: ':metric(tech_debt|sqale_debt_ratio)/:component/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/sonar/tech_debt/{component}': {
      get: {
        summary: 'Sonar Tech Debt',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          ...openApiQueryParams,
        ],
      },
    },
    '/sonar/tech_debt/{component}/{branch}': {
      get: {
        summary: 'Sonar Tech Debt (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          pathParam({ name: 'branch', example: 'master' }),
          ...openApiQueryParams,
        ],
      },
    },
  }

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
