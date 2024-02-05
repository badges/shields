import { pathParam } from '../index.js'
import SonarBase from './sonar-base.js'
import {
  queryParamSchema,
  openApiQueryParams,
  getLabel,
  positiveMetricColorScale,
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

  static get openApi() {
    const routes = {}
    routes[`/sonar/${metric}/{component}`] = {
      get: {
        summary: 'Sonar Documented API Density',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          ...openApiQueryParams,
        ],
      },
    }
    routes[`/sonar/${metric}/{component}/{branch}`] = {
      get: {
        summary: 'Sonar Documented API Density (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          pathParam({ name: 'branch', example: 'master' }),
          ...openApiQueryParams,
        ],
      },
    }
    return routes
  }

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
