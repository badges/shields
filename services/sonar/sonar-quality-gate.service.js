import { pathParam } from '../index.js'
import SonarBase from './sonar-base.js'
import {
  documentation,
  queryParamSchema,
  openApiQueryParams,
} from './sonar-helpers.js'

export default class SonarQualityGate extends SonarBase {
  static category = 'analysis'

  static route = {
    base: 'sonar',
    pattern: ':metric(quality_gate|alert_status)/:component/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/sonar/quality_gate/{component}': {
      get: {
        summary: 'Sonar Quality Gate',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:azdo-shellcheck' }),
          ...openApiQueryParams,
        ],
      },
    },
    '/sonar/quality_gate/{component}/{branch}': {
      get: {
        summary: 'Sonar Quality Gate (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'component', example: 'swellaby:azdo-shellcheck' }),
          pathParam({ name: 'branch', example: 'master' }),
          ...openApiQueryParams,
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'quality gate' }

  static render({ qualityState }) {
    if (qualityState === 'OK') {
      return {
        message: 'passed',
        color: 'success',
      }
    }
    return {
      message: 'failed',
      color: 'critical',
    }
  }

  async handle({ component, branch }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      branch,
      metricName: 'alert_status',
    })
    const { alert_status: qualityState } = this.transform({
      json,
      sonarVersion,
    })
    return this.constructor.render({ qualityState })
  }
}
