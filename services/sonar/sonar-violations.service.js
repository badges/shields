import { pathParam, queryParam } from '../index.js'
import { colorScale } from '../color-formatters.js'
import { metric } from '../text-formatters.js'
import SonarBase from './sonar-base.js'
import {
  getLabel,
  documentation,
  queryParamWithFormatSchema,
  openApiQueryParams,
} from './sonar-helpers.js'

const violationsColorScale = colorScale(
  [1, 2, 3, 5],
  ['brightgreen', 'yellowgreen', 'yellow', 'orange', 'red'],
)

const violationCategoryColorMap = {
  blocker_violations: 'red',
  critical_violations: 'orange',
  major_violations: 'yellow',
  minor_violations: 'yellowgreen',
  info_violations: 'green',
}

export default class SonarViolations extends SonarBase {
  static category = 'analysis'

  static route = {
    base: 'sonar',
    pattern:
      ':metric(violations|blocker_violations|critical_violations|major_violations|minor_violations|info_violations)/:component/:branch*',
    queryParamSchema: queryParamWithFormatSchema,
  }

  static openApi = {
    '/sonar/{metric}/{component}': {
      get: {
        summary: 'Sonar Violations',
        description: documentation,
        parameters: [
          pathParam({
            name: 'metric',
            example: 'violations',
            schema: { type: 'string', enum: this.getEnum('metric') },
          }),
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          ...openApiQueryParams,
          queryParam({
            name: 'format',
            example: 'long',
            schema: {
              type: 'string',
              enum: ['short', 'long'],
            },
            description: 'If not specified, the default is `short`.',
          }),
        ],
      },
    },
    '/sonar/{metric}/{component}/{branch}': {
      get: {
        summary: 'Sonar Violations (branch)',
        description: documentation,
        parameters: [
          pathParam({
            name: 'metric',
            example: 'violations',
            schema: { type: 'string', enum: this.getEnum('metric') },
          }),
          pathParam({ name: 'component', example: 'swellaby:letra' }),
          pathParam({ name: 'branch', example: 'master' }),
          ...openApiQueryParams,
          queryParam({
            name: 'format',
            example: 'long',
            schema: {
              type: 'string',
              enum: ['short', 'long'],
            },
            description: 'If not specified, the default is `short`.',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'violations' }

  static renderLongViolationsBadge(violations) {
    if (violations.violations === 0) {
      return {
        message: 0,
        color: 'brightgreen',
      }
    }

    let color
    const violationSummary = []

    if (violations.info_violations > 0) {
      violationSummary.push(`${violations.info_violations} info`)
      color = violationCategoryColorMap.info_violations
    }
    if (violations.minor_violations > 0) {
      violationSummary.unshift(`${violations.minor_violations} minor`)
      color = violationCategoryColorMap.minor_violations
    }
    if (violations.major_violations > 0) {
      violationSummary.unshift(`${violations.major_violations} major`)
      color = violationCategoryColorMap.major_violations
    }
    if (violations.critical_violations > 0) {
      violationSummary.unshift(`${violations.critical_violations} critical`)
      color = violationCategoryColorMap.critical_violations
    }
    if (violations.blocker_violations > 0) {
      violationSummary.unshift(`${violations.blocker_violations} blocker`)
      color = violationCategoryColorMap.blocker_violations
    }

    return {
      message: violationSummary.join(', '),
      color,
    }
  }

  static render({ violations, metricName, format }) {
    if (metricName === 'violations') {
      if (format === 'long') {
        return this.renderLongViolationsBadge(violations)
      }
      return {
        message: metric(violations),
        color: violationsColorScale(violations),
      }
    }

    const color =
      violations === 0 ? 'brightgreen' : violationCategoryColorMap[metricName]

    return {
      label: getLabel({ metric: metricName }),
      message: `${metric(violations)}`,
      color,
    }
  }

  transformViolations({ json, sonarVersion, metric, format }) {
    const metrics = this.transform({ json, sonarVersion })
    if (metric !== 'violations' || format !== 'long') {
      return { violations: metrics[metric] }
    }

    return { violations: metrics }
  }

  async handle(
    { component, metric, branch },
    { server, sonarVersion, format },
  ) {
    // If the user has requested the long format for the violations badge
    // then we need to include each individual violation metric in the call to the API
    // in order to get the count breakdown per each violation category.
    const metricKeys =
      metric === 'violations' && format === 'long'
        ? 'violations,blocker_violations,critical_violations,major_violations,minor_violations,info_violations'
        : metric
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      branch,
      metricName: metricKeys,
    })

    const { violations } = this.transformViolations({
      json,
      sonarVersion,
      metric,
      format,
    })
    return this.constructor.render({ violations, metricName: metric, format })
  }
}
