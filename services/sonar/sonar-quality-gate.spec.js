'use strict'

const { test, given } = require('sazerac')
const SonarQualityGate = require('./sonar-quality-gate.service')

describe('SonarQualityGate', function () {
  test(SonarQualityGate.render, () => {
    given({ qualityState: 'OK' }).expect({
      message: 'passed',
      color: 'success',
    })
    given({ qualityState: 'ERROR' }).expect({
      message: 'failed',
      color: 'critical',
    })
  })
})
