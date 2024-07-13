import { pathParam } from '../index.js'
import { coveragePercentage } from '../color-formatters.js'
import SonarBase from './sonar-base.js'
import {
  documentation,
  queryParamSchema,
  openApiQueryParams,
} from './sonar-helpers.js'

export default class SonarCoverage extends SonarBase {
  static category = 'coverage'

  static route = {
    base: 'sonar/coverage',
    pattern: ':component/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/sonar/coverage/{component}': {
      get: {
        summary: 'Sonar Coverage',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          ...openApiQueryParams,
        ],
      },
    },
    '/sonar/coverage/{component}/{branch}': {
      get: {
        summary: 'Sonar Coverage (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          pathParam({ name: 'branch', example: 'master' }),
          ...openApiQueryParams,
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'coverage' }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  async handle({ component, branch }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      branch,
      metricName: 'coverage',
    })
    const { coverage } = this.transform({
      json,
      sonarVersion,
    })
    return this.constructor.render({ coverage })
  }
}
