'use strict'

const { test, given } = require('sazerac')
const { metric } = require('../text-formatters')
const SonarViolations = require('./sonar-violations.service')

describe('SonarViolations', function() {
  test(SonarViolations.render, () => {
    given({ metricName: 'violations', violations: 1003 }).expect({
      message: metric(1003),
      color: 'red',
    })
    given({ metricName: 'violations', violations: 0 }).expect({
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
