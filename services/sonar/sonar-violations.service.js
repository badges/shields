'use strict'

const { colorScale } = require('../color-formatters')
const { metric } = require('../text-formatters')
const SonarBase = require('./sonar-base')
const {
  patternBase,
  queryParamWithFormatSchema,
  isLegacyVersion,
  getLabel,
} = require('./sonar-helpers')

const violationsColorScale = colorScale(
  [1, 2, 3, 5],
  ['brightgreen', 'yellowgreen', 'yellow', 'orange', 'red']
)

const violationCategoryColorMap = {
  blocker_violations: 'red',
  critical_violations: 'orange',
  major_violations: 'yellow',
  minor_violations: 'yellowgreen',
  info_violations: 'green',
}

module.exports = class SonarViolations extends SonarBase {
  static get category() {
    return 'analysis'
  }

  static get defaultBadgeData() {
    return { label: 'violations' }
  }

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

    return {
      label: getLabel({ metric: metricName }),
      message: `${metric(violations)}`,
      color: violationCategoryColorMap[metricName],
    }
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: `${patternBase}/:metric(violations|blocker_violations|critical_violations|major_violations|minor_violations|info_violations)`,
      queryParamSchema: queryParamWithFormatSchema,
    }
  }

  transformViolations({ json, version, metric, format }) {
    if (metric !== 'violations' || format !== 'long') {
      const { metricValue: violations } = this.transform({ json, version })
      return { violations }
    }

    const useLegacyApi = isLegacyVersion({ version })
    const measures = useLegacyApi ? json[0].msr : json.component.measures
    const violations = {}

    measures.forEach(measure => {
      if (useLegacyApi) {
        violations[measure.key] = measure.val
      } else {
        violations[measure.metric] = measure.value
      }
    })

    return { violations }
  }

  async handle({ protocol, host, component, metric }, { version, format }) {
    const metricKeys =
      metric === 'violations' && format === 'long'
        ? 'violations,blocker_violations,critical_violations,major_violations,minor_violations,info_violations'
        : metric
    const json = await this.fetch({
      version,
      protocol,
      host,
      component,
      metricName: metricKeys,
    })

    const { violations } = this.transformViolations({
      json,
      version,
      metric,
      format,
    })
    return this.constructor.render({ violations, metricName: metric, format })
  }
}
