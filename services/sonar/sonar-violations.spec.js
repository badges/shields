import { test, given } from 'sazerac'
import { metric } from '../text-formatters.js'
import SonarViolations from './sonar-violations.service.js'

describe('SonarViolations', function () {
  test(SonarViolations.render, () => {
    given({ metricName: 'violations', violations: 1003 }).expect({
      message: metric(1003),
      color: 'red',
    })
    given({ metricName: 'violations', violations: 0, format: 'short' }).expect({
      message: '0',
      color: 'brightgreen',
    })
    given({ metricName: 'violations', violations: 1 }).expect({
      message: '1',
      color: 'yellowgreen',
    })
    given({ metricName: 'violations', violations: 2 }).expect({
      message: '2',
      color: 'yellow',
    })
    given({ metricName: 'violations', violations: 3 }).expect({
      message: '3',
      color: 'orange',
    })
    given({ metricName: 'violations', violations: 4 }).expect({
      message: '4',
      color: 'orange',
    })
    given({ metricName: 'violations', violations: 5 }).expect({
      message: '5',
      color: 'red',
    })
    given({ metricName: 'blocker_violations', violations: 0 }).expect({
      label: 'blocker violations',
      message: '0',
      color: 'brightgreen',
    })
    given({ metricName: 'blocker_violations', violations: 1 }).expect({
      label: 'blocker violations',
      message: '1',
      color: 'red',
    })
    given({ metricName: 'critical_violations', violations: 0 }).expect({
      label: 'critical violations',
      message: '0',
      color: 'brightgreen',
    })
    given({ metricName: 'critical_violations', violations: 2 }).expect({
      label: 'critical violations',
      message: '2',
      color: 'orange',
    })
    given({ metricName: 'major_violations', violations: 0 }).expect({
      label: 'major violations',
      message: '0',
      color: 'brightgreen',
    })
    given({ metricName: 'major_violations', violations: 3 }).expect({
      label: 'major violations',
      message: '3',
      color: 'yellow',
    })
    given({ metricName: 'minor_violations', violations: 0 }).expect({
      label: 'minor violations',
      message: '0',
      color: 'brightgreen',
    })
    given({ metricName: 'minor_violations', violations: 1 }).expect({
      label: 'minor violations',
      message: '1',
      color: 'yellowgreen',
    })
    given({ metricName: 'info_violations', violations: 0 }).expect({
      label: 'info violations',
      message: '0',
      color: 'brightgreen',
    })
    given({ metricName: 'info_violations', violations: 4 }).expect({
      label: 'info violations',
      message: '4',
      color: 'green',
    })
  })

  test(SonarViolations.renderLongViolationsBadge, () => {
    given({ violations: 0 }).expect({
      message: 0,
      color: 'brightgreen',
    })
    given({ violations: 3, info_violations: 3 }).expect({
      message: '3 info',
      color: 'green',
    })
    given({ violations: 2, info_violations: 1, minor_violations: 1 }).expect({
      message: '1 minor, 1 info',
      color: 'yellowgreen',
    })
    given({ violations: 1, major_violations: 1 }).expect({
      message: '1 major',
      color: 'yellow',
    })
    given({ violations: 2, critical_violations: 2 }).expect({
      message: '2 critical',
      color: 'orange',
    })
    given({ violations: 6, info_violations: 5, blocker_violations: 1 }).expect({
      message: '1 blocker, 5 info',
      color: 'red',
    })
  })
})
