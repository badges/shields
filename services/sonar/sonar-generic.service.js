import { metric } from '../text-formatters.js'
import SonarBase from './sonar-base.js'
import { queryParamSchema, getLabel } from './sonar-helpers.js'

// This service is intended to be a temporary solution to avoid breaking
// any existing users/badges that were utilizing the "other" Sonar metrics
// with the Legacy Shields service implementation for Sonar badges.
// The legacy implementation simply rendered a brightgreen badge with the value,
// regardless of what the value actually was.
//
// See https://github.com/badges/shields/issues/3236 for more information.
//
// This service should gradually be replaced by services that handle
// their respective metrics by providing badges with more context
// (i.e. a red/error badge when there are multiple security issues)
//
// https://docs.sonarqube.org/latest/user-guide/metric-definitions
const complexityMetricNames = ['complexity', 'cognitive_complexity']
const duplicationMetricNames = [
  'duplicated_blocks',
  'duplicated_files',
  'duplicated_lines',
  'duplicated_lines_density',
]
// Sonar seemingly has used the terms 'issues' and 'violations' interchangeably
// so it's possible users are using both/either for badges
const issuesMetricNames = [
  'new_violations',
  'new_blocker_violations',
  'new_critical_violations',
  'new_major_violations',
  'new_minor_violations',
  'new_info_violations',
  'blocker_issues',
  'critical_issues',
  'major_issues',
  'minor_issues',
  'info_issues',
  'false_positive_issues',
  'open_issues',
  'confirmed_issues',
  'reopened_issues',
]
const maintainabilityMetricNames = [
  'code_smells',
  'new_code_smells',
  'sqale_rating',
  'sqale_index',
  'sqale_index',
  'new_technical_debt',
  'new_sqale_debt_ratio',
]
const reliabilityMetricNames = [
  'bugs',
  'new_bugs',
  'reliability_rating',
  'reliability_remediation_effort',
  'new_reliability_remediation_effort',
]
const securityMetricNames = [
  'vulnerabilities',
  'new_vulnerabilities',
  'security_rating',
  'security_remediation_effort',
  'new_security_remediation_effort',
]
const sizeMetricNames = [
  'classes',
  'comment_lines',
  'comment_lines_density',
  'directories',
  'files',
  'lines',
  'nloc',
  'projects',
  'statements',
]
const testsMetricNames = [
  'branch_coverage',
  'new_branch_coverage',
  'branch_coverage_hits_data',
  'conditions_by_line',
  'covered_conditions_by_line',
  'new_coverage',
  'line_coverage',
  'new_line_coverage',
  'coverage_line_hits_data',
  'lines_to_cover',
  'new_lines_to_cover',
  'uncovered_conditions',
  'new_uncovered_conditions',
  'uncovered_lines',
  'new_uncovered_lines',
]
const metricNames = [
  ...complexityMetricNames,
  ...duplicationMetricNames,
  ...issuesMetricNames,
  ...maintainabilityMetricNames,
  ...reliabilityMetricNames,
  ...securityMetricNames,
  ...sizeMetricNames,
  ...testsMetricNames,
]
const metricNameRouteParam = metricNames.join('|')

export default class SonarGeneric extends SonarBase {
  static category = 'analysis'

  static route = {
    base: 'sonar',
    pattern: `:metricName(${metricNameRouteParam})/:component/:branch*`,
    queryParamSchema,
  }

  static defaultBadgeData = { label: 'sonar' }

  static render({ metricName, metricValue }) {
    return {
      label: getLabel({ metric: metricName }),
      message: metric(metricValue),
      color: 'informational',
    }
  }

  async handle({ component, metricName, branch }, { server, sonarVersion }) {
    const json = await this.fetch({
      sonarVersion,
      server,
      component,
      branch,
      metricName,
    })

    const metrics = this.transform({ json, sonarVersion })
    return this.constructor.render({
      metricName,
      metricValue: metrics[metricName],
    })
  }
}
