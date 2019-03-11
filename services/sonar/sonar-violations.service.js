'use strict'

const { colorScale } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { patternBase, queryParamSchema, SonarBase } = require('./sonar-base')

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

  static render({ violations, metricName }) {
    if (metricName === 'violations') {
      return {
        message: metric(violations),
        color: violationsColorScale(violations),
      }
    }

    return {
      label: SonarBase.getLabel({ metric: metricName }),
      message: `${metric(violations[metricName])}`,
      color: violationCategoryColorMap[metricName] || 'brightgreen',
    }
  }

  static get route() {
    return {
      base: 'sonar',
      pattern: `${patternBase}/:metric(violations|blocker_violations|critical_violations|major_violations|minor_violations|info_violations)`,
      queryParamSchema,
    }
  }

  transformViolations({ json, version, metric }) {
    if (metric === 'violations') {
      const { metricValue: violations } = this.transform({ json, version })
      return { violations }
    }

    const useLegacyApi = this.useLegacyApi({ version })
    const measures = useLegacyApi ? json[0].msr : json.component.measures
    const violations = {}

    measures.forEach(measure => {
      violations[measure.metric] = measure.value
    })

    return { violations }
  }

  async handle({ protocol, host, buildType, metric }, { version }) {
    const metricName = 'violations'
    const json = await this.fetch({
      version,
      protocol,
      host,
      buildType,
      metricName,
    })
    const { violations } = this.transformViolations({ json, version, metric })
    return this.constructor.render({ violations, metricName: metric })
  }
}
