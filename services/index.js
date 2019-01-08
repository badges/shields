'use strict'

const base = require('../core/base-service')
const createServiceTester = require('../core/service-test-runner/create-service-tester')
const ServiceTester = require('../core/service-test-runner/service-tester')

module.exports = {
  ...base,
  createServiceTester,
  ServiceTester,
}
